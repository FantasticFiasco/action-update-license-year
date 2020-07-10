// @ts-nocheck
import { setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { run } from '../src/action-update-license-year';
import { updateLicense } from '../src/license';

jest.mock('@actions/core', () => ({
    getInput: jest.fn().mockReturnValue(''),
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
            return params.ref === 'heads/master' ? res.getRef.success : res.getRef.failure;
        });
        octokit.repos.getContent.mockResolvedValue(res.getContent.success);
        updateLicense.mockReturnValue('some updated license');
        octokit.git.createRef.mockResolvedValue();
        octokit.pulls.list.mockResolvedValue({ data: [] });
        octokit.pulls.create.mockResolvedValue({});
        await run();
        expect(octokit.git.createRef.mock.calls.length).toBe(1);
        expect(octokit.repos.createOrUpdateFileContents.mock.calls.length).toBe(1);
        expect(octokit.pulls.create.mock.calls.length).toBe(1);
        expect(setFailed.mock.calls.length).toBe(0);
    });
});

const res = {
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
};
