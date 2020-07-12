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
    return jest.fn().mockImplementation(() => {
        return mockRepository;
    });
});

const mockLicense = {
    updateLicense: jest.fn(),
};
jest.mock('../src/license', () => {
    return mockLicense;
});

const { run, FILENAME, BRANCH_NAME } = require('../src/action-update-license-year');

describe('action should', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        mockRepository.getContent.mockReturnValue(GET_CONTENT_SUCCESS_RESPONSE);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(1);
    });

    test('skip creating branch given it exists', async () => {
        mockRepository.hasBranch.mockReturnValue(true);
        mockRepository.getContent.mockReturnValue(GET_CONTENT_SUCCESS_RESPONSE);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test('skip creating branch given license is unchanged', async () => {
        mockLicense.updateLicense.mockReturnValue(CONTENT);
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(0);
    });

    test("create pull request given it doesn't exist", async () => {
        // TODO: Mock that pr doesn't exist
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(1);
    });

    test('skip creating pull request given it exists', async () => {
        // TODO: Mock that pr exists
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(0);
    });

    test('skip creating pull request given license is unchanged', async () => {
        mockLicense.updateLicense.mockReturnValue(CONTENT);
        await run();
        expect(mockRepository.createPullRequest).toBeCalledTimes(0);
    });

    // test('create pull request given branch exist', async () => {
    //     mockCore.getInput.mockReturnValue('some token');
    //     mockRepository.hasBranch.mockReturnValue(true);
    //     mockRepository.getContent.mockReturnValue(GET_CONTENT_SUCCESS_RESPONSE);
    //     mockLicense.updateLicense.mockReturnValue('some updated license');
    //     await run();
    //     expect(mockRepository.getContent).toBeCalledWith(BRANCH_NAME, FILENAME);
    //     expect(mockRepository.createBranch).toBeCalledTimes(0);
    //     expect(mockRepository.updateContent).toBeCalledTimes(1);
    //     expect(mockRepository.createPullRequest).toBeCalledTimes(1);
    //     expect(mockCore.setFailed).toBeCalledTimes(0);
    // });
});
const CONTENT = 'some license';
const GET_CONTENT_SUCCESS_RESPONSE = {
    data: {
        content: Buffer.from(CONTENT).toString('base64'),
    },
};
