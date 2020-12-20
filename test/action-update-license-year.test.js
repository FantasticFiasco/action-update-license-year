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
    parseInput: jest.fn(),
    CURRENT_YEAR: jest.requireActual('../src/inputs').CURRENT_YEAR,
    BRANCH_NAME: jest.requireActual('../src/inputs').BRANCH_NAME,
    COMMIT_TITLE: jest.requireActual('../src/inputs').COMMIT_TITLE,
    COMMIT_BODY: jest.requireActual('../src/inputs').COMMIT_BODY,
    PR_TITLE: jest.requireActual('../src/inputs').PR_TITLE,
    PR_BODY: jest.requireActual('../src/inputs').PR_BODY,
    ASSIGNEES: jest.requireActual('../src/inputs').ASSIGNEES,
    LABELS: jest.requireActual('../src/inputs').LABELS,
};
jest.mock('../src/inputs', () => {
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
const { COMMIT_TITLE, COMMIT_BODY, PR_TITLE, PR_BODY, BRANCH_NAME, CURRENT_YEAR } = require('../src/inputs');

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
        expect(mockRepository.getContent).toBeCalledWith(BRANCH_NAME.defaultValue, FILENAME);
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
        expect(mockRepository.createBranch).toBeCalledWith(BRANCH_NAME.defaultValue);
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

    test('update content with default commit title and body', async () => {
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            BRANCH_NAME.defaultValue,
            FILENAME,
            undefined,
            undefined,
            COMMIT_TITLE.defaultValue
        );
    });

    test('update content with custom commit title and default body', async () => {
        mockConfigReturnValue({ commitTitle: 'some commit title' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            BRANCH_NAME.defaultValue,
            FILENAME,
            undefined,
            undefined,
            'some commit title'
        );
    });

    test('update content with default commit title and custom body', async () => {
        mockConfigReturnValue({ commitBody: 'some commit body' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            BRANCH_NAME.defaultValue,
            FILENAME,
            undefined,
            undefined,
            `${COMMIT_TITLE.defaultValue}\n\nsome commit body`
        );
    });

    test('update content with custom commit title and body', async () => {
        mockConfigReturnValue({ commitTitle: 'some commit title', commitBody: 'some commit body' });
        await run();
        expect(setFailed).toBeCalledTimes(0);
        expect(mockRepository.updateContent).toBeCalledWith(
            BRANCH_NAME.defaultValue,
            FILENAME,
            undefined,
            undefined,
            'some commit title\n\nsome commit body'
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
            mockConfigReturnValue({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: PR_BODY.defaultValue });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                PR_BODY.defaultValue
            );
        });

        test('create pull request with default title and custom body', async () => {
            mockConfigReturnValue({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: 'some pr body' });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                'some pr body'
            );
        });

        test('create pull request with custom title and default body', async () => {
            mockConfigReturnValue({ pullRequestTitle: 'some pr title', pullRequestBody: PR_BODY.defaultValue });
            mockRepository.hasPullRequest.mockResolvedValue(false);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                'some pr title',
                PR_BODY.defaultValue
            );
        });

        test('create pull request with custom title and body', async () => {
            mockConfigReturnValue({ pullRequestTitle: 'some pr title', pullRequestBody: 'some pr body' });
            mockRepository.hasPullRequest.mockResolvedValue(false);
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
            mockConfigReturnValue({ assignees: ['assignee1', 'assignee2', 'assignee3'] });
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
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
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
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
 * @property {string} [commitTitle]
 * @property {string} [commitBody]
 * @property {string} [pullRequestTitle]
 * @property {string} [pullRequestBody]
 * @property {string[]} [assignees]
 * @property {string[]} [labels]
 */
function mockConfigReturnValue(config) {
    mockConfig.parseInput.mockReturnValue({
        token: config.token || 'some token',
        branchName: config.branchName || BRANCH_NAME.defaultValue,
        commitTitle: config.commitTitle || COMMIT_TITLE.defaultValue,
        commitBody: config.commitBody || COMMIT_BODY.defaultValue,
        pullRequestTitle: config.pullRequestTitle || PR_TITLE.defaultValue,
        pullRequestBody: config.pullRequestBody || PR_BODY.defaultValue,
        assignees: config.assignees || [],
        labels: config.labels || [],
    });
}