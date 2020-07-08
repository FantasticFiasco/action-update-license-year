import { setFailed } from '@actions/core';
import { run } from '../src/action-update-license-year';

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
}));

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        await run();
        expect(setFailed.mock.calls.length).toBe(0);
    });
});
