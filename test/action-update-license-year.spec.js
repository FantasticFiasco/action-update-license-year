import { setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { run } from '../src/action-update-license-year';

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
            getRef: jest.fn(),
        },
    }),
}));

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        getOctokit('').git.getRef.mockResolvedValue({ status: 200 });
        await run();
        expect(setFailed.mock.calls.length).toBe(0);
    });
});
