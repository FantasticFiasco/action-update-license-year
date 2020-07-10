// @ts-nocheck
import { setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { run } from '../src/action-update-license-year';
import { updateLicense } from '../src/license';

jest.mock('@actions/core', () => ({
    getInput: jest.fn().mockReturnValue('some token'),
    setFailed: jest.fn(),
}));

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        },
    },
    getOctokit: jest.fn().mockReturnValue({
        git: {
            createRef: jest.fn(),
            getRef: jest.fn(),
        },
        repos: {
            getContent: jest.fn(),
            createOrUpdateFileContents: jest.fn(),
        },
        pulls: {
            list: jest.fn(),
            create: jest.fn(),
        },
    }),
}));

jest.mock('../src/license', () => ({
    updateLicense: jest.fn(),
}));

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        const octokit = getOctokit('some token');
        octokit.git.getRef.mockImplementation((params) => {
            return params.ref === 'heads/master' ? res.git.getRef.success : res.git.getRef.failure;
        });
        octokit.repos.getContent.mockResolvedValue(res.git.getContent.success);
        updateLicense.mockReturnValue('some updated license');
        octokit.git.createRef.mockResolvedValue();
        octokit.pulls.list.mockResolvedValue(res.pulls.list.notEmpty);
        octokit.pulls.create.mockResolvedValue({});
        await run();
        expect(octokit.git.createRef).toBeCalledTimes(1);
        expect(octokit.repos.createOrUpdateFileContents).toBeCalledTimes(1);
        expect(octokit.pulls.create).toBeCalledTimes(1);
        expect(setFailed).toBeCalledTimes(0);
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
