const mockCore = {
    getInput: jest.fn(),
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

const mockRepository = {
    hasBranch: jest.fn(),
    createBranch: jest.fn(),
    getContent: jest.fn(),
    updateContent: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
};
jest.mock('../src/Repository', () => {
    return function () {
        return mockRepository;
    };
});

const mockLicense = {
    updateLicense: jest.fn(),
};
jest.mock('../src/license', () => {
    return mockLicense;
});

const { setFailed } = require('@actions/core');
const { run, FILENAME, BRANCH_NAME } = require('../src/action-update-license-year');

describe('action should', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        mockRepository.getContent.mockReturnValue(GET_LICENSE_CONTENT_SUCCESS_RESPONSE);
    });

    test('read input', async () => {
        await run();
        expect(mockCore.getInput).toBeCalledWith('token', { required: true });
    });

    test('download license from branch given branch exists', async () => {
        mockRepository.hasBranch.mockReturnValue(true);
        await run();
        expect(mockRepository.getContent).toBeCalledWith(BRANCH_NAME, FILENAME);
    });

    test("download license from master given branch doesn't exist", async () => {
        mockRepository.hasBranch.mockReturnValue(false);
        await run();
        expect(mockRepository.getContent).toBeCalledWith('master', FILENAME);
    });

    test("create branch given it doesn't exist", async () => {
        mockRepository.hasBranch.mockReturnValue(false);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(1);
    });

    test('skip creating branch given it exists', async () => {
        mockRepository.hasBranch.mockReturnValue(true);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test('skip creating branch given license is unchanged', async () => {
        mockLicense.updateLicense.mockReturnValue(LICESE_CONTENT);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test("create pull request given it doesn't exist", async () => {
        mockRepository.hasPullRequest.mockReturnValue(false);
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(1);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('skip creating pull request given it exists', async () => {
        mockRepository.hasPullRequest.mockReturnValue(true);
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(0);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('skip creating pull request given license is unchanged', async () => {
        mockLicense.updateLicense.mockReturnValue(LICESE_CONTENT);
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(0);
        expect(setFailed).toBeCalledTimes(0);
    });
});

const LICESE_CONTENT = 'some license';

const GET_LICENSE_CONTENT_SUCCESS_RESPONSE = {
    data: {
        content: Buffer.from(LICESE_CONTENT).toString('base64'),
    },
};
