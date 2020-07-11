const mockRepository = {
    hasBranch: jest.fn(),
    createBranch: jest.fn(),
    getContent: jest.fn(),
    updateContent: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
};

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/license');
jest.mock('../src/Repository', () => {
    return jest.fn().mockImplementation(() => {
        return mockRepository;
    });
});

const { run } = require('../src/action-update-license-year');
const { getInput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { updateLicense } = require('../src/license');

describe('running action should', () => {
    beforeEach(() => {
        context.repo = {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        };
    });

    test("create PR with updated license given branch doesn't exist", async () => {
        getInput.mockReturnValue('some token');
        mockRepository.hasBranch.mockReturnValue(false);
        mockRepository.getContent.mockReturnValue({
            data: {
                content: Buffer.from('some license').toString('base64'),
            },
        });
        updateLicense.mockReturnValue('some updated license');
        await run();
        expect(mockRepository.createBranch).toBeCalledTimes(1);
        expect(mockRepository.updateContent).toBeCalledTimes(1);
        expect(mockRepository.createPullRequest).toBeCalledTimes(1);
        expect(setFailed).toBeCalledTimes(0);
    });
});
