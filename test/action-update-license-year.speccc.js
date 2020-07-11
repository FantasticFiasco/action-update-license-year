// @ts-nocheck
import { run } from '../src/action-update-license-year';

jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setFailed: jest.fn(),
}));

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        },
    },
}));

jest.mock('../src/license', () => ({
    updateLicense: jest.fn(),
}));

jest.mock('../src/Repository', () => ({
    getBranch: jest.fn(),
    hasBranch: jest.fn(),
    createBranch: jest.fn(),
    getContent: jest.fn(),
    updateContent: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
}));

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        // Repository.mock.

        // const octokit = getOctokit('some token');
        // octokit.git.getRef.mockImplementation((params) => {
        //     return params.ref === 'heads/master' ? res.git.getRef.success : res.git.getRef.failure;
        // });
        // octokit.repos.getContent.mockResolvedValue(res.git.getContent.success);
        // updateLicense.mockReturnValue('some updated license');
        // octokit.git.createRef.mockResolvedValue();
        // octokit.pulls.list.mockResolvedValue(res.pulls.list.notEmpty);
        // octokit.pulls.create.mockResolvedValue({});
        await run();
        // expect(octokit.git.createRef).toBeCalledTimes(1);
        // expect(octokit.repos.createOrUpdateFileContents).toBeCalledTimes(1);
        // expect(octokit.pulls.create).toBeCalledTimes(1);
        // expect(setFailed).toBeCalledTimes(0);
    });
});

const res = {
    git: {
        getRef: {
            success: Promise.resolve({
                status: 200,
                data: {
                    object: {
                        sha: 'some sha',
                    },
                },
            }),
            failure: Promise.reject({
                status: 404,
            }),
        },
        getContent: {
            success: {
                data: {
                    content: Buffer.from('some license').toString('base64'),
                },
            },
        },
    },
    pulls: {
        list: {
            notEmpty: {
                data: [],
            },
        },
    },
};
