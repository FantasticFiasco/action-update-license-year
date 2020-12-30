// @actions/core
const mockCore = {
    info: jest.fn(),
    setFailed: jest.fn(),
};
jest.mock('@actions/core', () => {
    return mockCore;
});

// @actions/github
const mockGithub = {
    context: {
        repo: {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        },
    },
};
jest.mock('@actions/github', () => {
    return mockGithub;
});

// ../src/inputs
const mockInputs = {
    parseInput: jest.fn(),
    TOKEN: jest.requireActual('../src/inputs').TOKEN,
    PATH: jest.requireActual('../src/inputs').PATH,
    TRANSFORM: jest.requireActual('../src/inputs').TRANSFORM,
    BRANCH_NAME: jest.requireActual('../src/inputs').BRANCH_NAME,
    COMMIT_TITLE: jest.requireActual('../src/inputs').COMMIT_TITLE,
    COMMIT_BODY: jest.requireActual('../src/inputs').COMMIT_BODY,
    PR_TITLE: jest.requireActual('../src/inputs').PR_TITLE,
    PR_BODY: jest.requireActual('../src/inputs').PR_BODY,
    ASSIGNEES: jest.requireActual('../src/inputs').ASSIGNEES,
    LABELS: jest.requireActual('../src/inputs').LABELS,
    CURRENT_YEAR: jest.requireActual('../src/inputs').CURRENT_YEAR,
};
jest.mock('../src/inputs', () => {
    return mockInputs;
});

// ../src/repository
const mockRepository = {
    authenticate: jest.fn(),
    branchExists: jest.fn(),
    checkoutBranch: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    hasChanges: jest.fn(),
    stageWrittenFiles: jest.fn(),
    commit: jest.fn(),
    push: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
    addAssignees: jest.fn(),
    addLabels: jest.fn(),
};
jest.mock('../src/repository', () => {
    return function () {
        return mockRepository;
    };
});

// ../src/search
const mockSearch = {
    search: jest.fn(),
};
jest.mock('../src/search', () => {
    return mockSearch;
});

// ../src/transforms
const mockTransforms = {
    applyTransform: jest.fn(),
};
jest.mock('../src/transforms', () => {
    return mockTransforms;
});

const { setFailed } = require('@actions/core');
const { run } = require('../src/action-update-license-year');
const {
    PATH,
    TRANSFORM,
    BRANCH_NAME,
    COMMIT_TITLE,
    COMMIT_BODY,
    PR_TITLE,
    PR_BODY,
    CURRENT_YEAR,
} = require('../src/inputs');

describe('action should', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        process.env.GITHUB_WORKSPACE = '/some/workspace';
        setupInput({});
    });

    afterEach(() => {
        delete process.env.GITHUB_WORKSPACE;
    });

    test('set failed given no working directory', async () => {
        delete process.env.GITHUB_WORKSPACE;
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('authenticate git user', async () => {
        mockSearch.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.authenticate).toBeCalled();
        expect(setFailed).toBeCalledTimes(0);
    });

    test('checkout existing branch with default name given it exists', async () => {
        mockRepository.branchExists.mockResolvedValue(true);
        mockSearch.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith(BRANCH_NAME.defaultValue, false);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('checkout existing branch with custom name given it exists', async () => {
        setupInput({ branchName: 'some-branch-name' });
        mockRepository.branchExists.mockResolvedValue(true);
        mockSearch.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith('some-branch-name', false);
        expect(setFailed).toBeCalledTimes(0);
    });

    test("create new branch with default name given it doesn't exist", async () => {
        mockRepository.branchExists.mockResolvedValue(false);
        mockSearch.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith(BRANCH_NAME.defaultValue, true);
        expect(setFailed).toBeCalledTimes(0);
    });

    test("create new branch with custom name given it doesn't exist", async () => {
        setupInput({ branchName: 'some-branch-name' });
        mockRepository.branchExists.mockResolvedValue(false);
        mockSearch.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith('some-branch-name', true);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('set failed given no files matching the path', async () => {
        mockSearch.search.mockResolvedValue([]);
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('applies default transform on all files matching the path', async () => {
        mockSearch.search.mockResolvedValue(['some-file-1', 'some-file-2']);
        await run();
        expect(mockTransforms.applyTransform).nthCalledWith(
            1,
            TRANSFORM.defaultValue,
            undefined,
            CURRENT_YEAR,
            'some-file-1'
        );
        expect(mockTransforms.applyTransform).nthCalledWith(
            2,
            TRANSFORM.defaultValue,
            undefined,
            CURRENT_YEAR,
            'some-file-2'
        );
        expect(setFailed).toBeCalledTimes(0);
    });

    test('applies custom transform on all files matching the path', async () => {
        setupInput({ transform: 'custom transform' });
        mockSearch.search.mockResolvedValue(['some-file-1', 'some-file-2']);
        await run();
        expect(mockTransforms.applyTransform).nthCalledWith(
            1,
            'custom transform',
            undefined,
            CURRENT_YEAR,
            'some-file-1'
        );
        expect(mockTransforms.applyTransform).nthCalledWith(
            2,
            'custom transform',
            undefined,
            CURRENT_YEAR,
            'some-file-2'
        );
        expect(setFailed).toBeCalledTimes(0);
    });

    test('writes file given transform updates it', async () => {
        mockSearch.search.mockResolvedValue(['some-file']);
        mockTransforms.applyTransform.mockReturnValue('updated content');
        await run();
        expect(mockRepository.writeFile).toBeCalledWith('some-file', 'updated content');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('aborts if no files where changed', async () => {
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(false);
        await run();
        expect(mockRepository.stageWrittenFiles).toBeCalledTimes(0);
        expect(mockRepository.commit).toBeCalledTimes(0);
        expect(mockRepository.push).toBeCalledTimes(0);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('stages, commits and pushes if files where changed', async () => {
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.stageWrittenFiles).toBeCalledTimes(1);
        expect(mockRepository.commit).toBeCalledTimes(1);
        expect(mockRepository.push).toBeCalledTimes(1);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with default commit title and body', async () => {
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith(COMMIT_TITLE.defaultValue);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with custom commit title and default body', async () => {
        setupInput({ commitTitle: 'some commit title' });
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith('some commit title');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with default commit title and custom body', async () => {
        setupInput({ commitBody: 'some commit body' });
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith(`${COMMIT_TITLE.defaultValue}\n\nsome commit body`);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with custom commit title and custom body', async () => {
        setupInput({ commitTitle: 'some commit title', commitBody: 'some commit body' });
        mockSearch.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith('some commit title\n\nsome commit body');
        expect(setFailed).toBeCalledTimes(0);
    });

    describe("given pull request doesn't exist", () => {
        test('skip creating pull request given files are unchanged', async () => {
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(false);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with default title and body', async () => {
            setupInput({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: PR_BODY.defaultValue });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                PR_BODY.defaultValue
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with default title and custom body', async () => {
            setupInput({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: 'some pr body' });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                'some pr body'
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with custom title and default body', async () => {
            setupInput({ pullRequestTitle: 'some pr title', pullRequestBody: PR_BODY.defaultValue });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                'some pr title',
                PR_BODY.defaultValue
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with custom title and body', async () => {
            setupInput({ pullRequestTitle: 'some pr title', pullRequestBody: 'some pr body' });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                'some pr title',
                'some pr body'
            );
        });

        test('create pull request and add assignees given configuration', async () => {
            setupInput({ assignees: ['assignee1', 'assignee2', 'assignee3'] });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
            await run();
            expect(mockRepository.addAssignees).toBeCalledWith(42, ['assignee1', 'assignee2', 'assignee3']);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and skip adding assignees given no configuration', async () => {
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.addAssignees).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and add labels given configuration', async () => {
            setupInput({ labels: ['some label 1', 'some label 2', 'some label 3'] });
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
            await run();
            expect(mockRepository.addLabels).toBeCalledWith(42, ['some label 1', 'some label 2', 'some label 3']);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and skip adding labels given no configuration', async () => {
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.addLabels).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('set failed given creating pull request fails', async () => {
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockRejectedValue({});
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(setFailed).toBeCalledTimes(1);
        });
    });

    describe('given pull request exists', () => {
        test('skip creating pull request', async () => {
            mockSearch.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.hasPullRequest.mockResolvedValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });
    });
});

/**
 * @param {configType} config
 * @typedef configType
 * @property {string} [token]
 * @property {string} [path]
 * @property {string} [transform]
 * @property {string} [branchName]
 * @property {string} [commitTitle]
 * @property {string} [commitBody]
 * @property {string} [pullRequestTitle]
 * @property {string} [pullRequestBody]
 * @property {string[]} [assignees]
 * @property {string[]} [labels]
 */
function setupInput(config) {
    mockInputs.parseInput.mockReturnValue({
        token: config.token || 'some token',
        path: config.path || PATH.defaultValue,
        transform: config.transform || TRANSFORM.defaultValue,
        branchName: config.branchName || BRANCH_NAME.defaultValue,
        commitTitle: config.commitTitle || COMMIT_TITLE.defaultValue,
        commitBody: config.commitBody || COMMIT_BODY.defaultValue,
        pullRequestTitle: config.pullRequestTitle || PR_TITLE.defaultValue,
        pullRequestBody: config.pullRequestBody || PR_BODY.defaultValue,
        assignees: config.assignees || [],
        labels: config.labels || [],
    });
}
