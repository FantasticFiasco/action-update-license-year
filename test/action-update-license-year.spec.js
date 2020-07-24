const mockCore = {
    info: jest.fn(),
    setFailed: jest.fn(),
};
jest.mock('@actions/core', () => {
    return mockCore;
});

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

const mockConfig = {
    CURRENT_YEAR: jest.requireActual('../src/config').CURRENT_YEAR,
    DEFAULT_BRANCH_NAME: jest.requireActual('../src/config').DEFAULT_BRANCH_NAME,
    DEFAULT_COMMIT_MESSAGE: jest.requireActual('../src/config').DEFAULT_COMMIT_MESSAGE,
    DEFAULT_COMMIT_BODY: jest.requireActual('../src/config').DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE: jest.requireActual('../src/config').DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY: jest.requireActual('../src/config').DEFAULT_PR_BODY,
    DEFAULT_ASSIGNEES: jest.requireActual('../src/config').DEFAULT_ASSIGNEES,
    DEFAULT_LABELS: jest.requireActual('../src/config').DEFAULT_LABELS,
    parseConfig: jest.fn(),
};
jest.mock('../src/config', () => {
    return mockConfig;
});

const mockRepository = {
    hasBranch: jest.fn(),
    createBranch: jest.fn(),
    getContent: jest.fn(),
    updateContent: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
    addAssignees: jest.fn(),
    addLabels: jest.fn(),
};
jest.mock('../src/Repository', () => {
    return function () {
        return mockRepository;
    };
});

const mockLicense = {
    transformLicense: jest.fn(),
};
jest.mock('../src/license', () => {
    return mockLicense;
});

const { setFailed } = require('@actions/core');
const { run, MASTER, FILENAME } = require('../src/action-update-license-year');
const {
    DEFAULT_COMMIT_MESSAGE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
    DEFAULT_BRANCH_NAME,
    CURRENT_YEAR,
} = require('../src/config');

describe('action should', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        mockConfigReturnValue({});
        mockRepository.getContent.mockResolvedValue(GET_CONTENT_SUCCESS_RESPONSE);
    });

    test('get license from branch given branch exists', async () => {
        mockRepository.hasBranch.mockResolvedValue(true);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.getContent).toBeCalledWith(DEFAULT_BRANCH_NAME, FILENAME);
    });

    test("get license from master given branch doesn't exist", async () => {
        mockRepository.hasBranch.mockResolvedValue(false);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.getContent).toBeCalledWith(MASTER, FILENAME);
    });

    test('set failed given get license fails', async () => {
        mockRepository.getContent.mockRejectedValue({});
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('transform license using current year', async () => {
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockLicense.transformLicense).toBeCalledWith(LICESE_CONTENT, CURRENT_YEAR);
    });

    test("create branch with default name given branch doesn't exist", async () => {
        mockRepository.hasBranch.mockResolvedValue(false);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.createBranch).toBeCalledTimes(1);
        expect(mockRepository.createBranch).toBeCalledWith(DEFAULT_BRANCH_NAME);
    });

    test("create branch with custom name given branch doesn't exist", async () => {
        mockConfigReturnValue({ branchName: 'some-branch-name' });
        mockRepository.hasBranch.mockResolvedValue(false);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.createBranch).toBeCalledTimes(1);
        expect(mockRepository.createBranch).toBeCalledWith('some-branch-name');
    });

    test('skip creating branch given branch exists', async () => {
        mockRepository.hasBranch.mockResolvedValue(true);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test('skip creating branch given license is unchanged', async () => {
        mockLicense.transformLicense.mockReturnValue(LICESE_CONTENT);
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test('set failed given creating branch fails', async () => {
        mockRepository.createBranch.mockRejectedValue({});
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('update content with default commit message and body', async () => {
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            DEFAULT_BRANCH_NAME,
            FILENAME,
            undefined,
            undefined,
            DEFAULT_COMMIT_MESSAGE
        );
    });

    test('update content with custom commit message and default body', async () => {
        mockConfigReturnValue({ commitMessage: 'some commit message' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            DEFAULT_BRANCH_NAME,
            FILENAME,
            undefined,
            undefined,
            'some commit message'
        );
    });

    test('update content with default commit message and custom body', async () => {
        mockConfigReturnValue({ commitBody: 'some commit body' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            DEFAULT_BRANCH_NAME,
            FILENAME,
            undefined,
            undefined,
            `${DEFAULT_COMMIT_MESSAGE}\n\nsome commit body`
        );
    });

    test('update content with custom commit message and body', async () => {
        mockConfigReturnValue({ commitMessage: 'some commit message', commitBody: 'some commit body' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            DEFAULT_BRANCH_NAME,
            FILENAME,
            undefined,
            undefined,
            'some commit message\n\nsome commit body'
        );
    });

    describe("given pull request doesn't exist", () => {
        test('skip creating pull request given license is unchanged', async () => {
            mockLicense.transformLicense.mockReturnValue(LICESE_CONTENT);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
        });

        test('create pull request with default title and body', async () => {
            mockConfigReturnValue({ pullRequestTitle: DEFAULT_PR_TITLE, pullRequestBody: DEFAULT_PR_BODY });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                DEFAULT_BRANCH_NAME,
                DEFAULT_PR_TITLE,
                DEFAULT_PR_BODY
            );
        });

        test('create pull request with default title and custom body', async () => {
            mockConfigReturnValue({ pullRequestTitle: DEFAULT_PR_TITLE, pullRequestBody: 'some pr body' });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                DEFAULT_BRANCH_NAME,
                DEFAULT_PR_TITLE,
                'some pr body'
            );
        });

        test('create pull request with custom title and default body', async () => {
            mockConfigReturnValue({ pullRequestTitle: 'some pr title', pullRequestBody: DEFAULT_PR_BODY });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                DEFAULT_BRANCH_NAME,
                'some pr title',
                DEFAULT_PR_BODY
            );
        });

        test('create pull request with custom title and body', async () => {
            mockConfigReturnValue({ pullRequestTitle: 'some pr title', pullRequestBody: 'some pr body' });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                DEFAULT_BRANCH_NAME,
                'some pr title',
                'some pr body'
            );
        });

        test('create pull request and add assignees given configuration', async () => {
            mockConfigReturnValue({ assignees: ['assignee1', 'assignee2', 'assignee3'] });
            mockRepository.createPullRequest.mockResolvedValue({ data: { id: 42 } });
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.addAssignees).toBeCalledTimes(1);
            expect(mockRepository.addAssignees).toBeCalledWith(42, ['assignee1', 'assignee2', 'assignee3']);
        });

        test('create pull request and skip adding assignees given no configuration', async () => {
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.addAssignees).toBeCalledTimes(0);
        });

        test('create pull request and add labels given configuration', async () => {
            mockConfigReturnValue({ labels: ['some label 1', 'some label 2', 'some label 3'] });
            mockRepository.createPullRequest.mockResolvedValue({ data: { id: 42 } });
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.addLabels).toBeCalledTimes(1);
            expect(mockRepository.addLabels).toBeCalledWith(42, ['some label 1', 'some label 2', 'some label 3']);
        });

        test('create pull request and skip adding labels given no configuration', async () => {
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.addLabels).toBeCalledTimes(0);
        });

        test('set failed given creating pull request fails', async () => {
            mockRepository.createPullRequest.mockRejectedValue({});
            await run();
            expect(setFailed).toBeCalledTimes(1);
        });
    });

    describe('given pull request exists', () => {
        test('skip creating pull request', async () => {
            mockRepository.hasPullRequest.mockResolvedValue(true);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
        });
    });
});

const LICESE_CONTENT = 'some license';

const GET_CONTENT_SUCCESS_RESPONSE = {
    data: {
        content: Buffer.from(LICESE_CONTENT).toString('base64'),
    },
};

/**
 * @param {configType} config
 * @typedef configType
 * @property {string} [token]
 * @property {string} [branchName]
 * @property {string} [commitMessage]
 * @property {string} [commitBody]
 * @property {string} [pullRequestTitle]
 * @property {string} [pullRequestBody]
 * @property {string[]} [assignees]
 * @property {string[]} [labels]
 */
function mockConfigReturnValue(config) {
    mockConfig.parseConfig.mockReturnValue({
        token: config.token || 'some token',
        branchName: config.branchName || DEFAULT_BRANCH_NAME,
        commitMessage: config.commitMessage || DEFAULT_COMMIT_MESSAGE,
        commitBody: config.commitBody || DEFAULT_COMMIT_BODY,
        pullRequestTitle: config.pullRequestTitle || DEFAULT_PR_TITLE,
        pullRequestBody: config.pullRequestBody || DEFAULT_PR_BODY,
        assignees: config.assignees || [],
        labels: config.labels || [],
    });
}
