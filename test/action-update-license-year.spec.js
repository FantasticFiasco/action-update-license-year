const mockCore = {
    getInput: jest.fn(),
    setFailed: jest.fn(),
};
jest.mock('@actions/core', () => {
    return mockCore;
});

const mockGithub = {
    context: jest.fn(),
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

const { run } = require('../src/action-update-license-year');

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        mockGithub.context.mockImplementation(() => {
            return {
                repo: { owner: 'FantasticFiasco', repo: 'action-update-license-year' },
            };
        });
        mockCore.getInput.mockReturnValue('some token');
        mockRepository.hasBranch.mockReturnValue(false);
        mockRepository.getContent.mockReturnValue({
            data: {
                content: Buffer.from('some license').toString('base64'),
            },
        });
        mockLicense.updateLicense.mockReturnValue('some updated license');
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(1);
        expect(mockRepository.updateContent).toBeCalledTimes(1);
        expect(mockRepository.createPullRequest).toBeCalledTimes(1);
        expect(mockCore.setFailed).toBeCalledTimes(0);
    });
});
