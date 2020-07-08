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
        getOctokit('').git.getRef.mockImplementation((params) => {
            const res =
                params && params.ref === 'heads/master'
                    ? Promise.resolve({ status: 200, data: { object: { sha: 'sha' } } })
                    : Promise.reject({ status: 404 });
            return res;
        });
        getOctokit('').repos.getContent.mockResolvedValue({ data: { content: Buffer.from('license').toString('base64') } });
        updateLicense.mockReturnValue('updated license');
        getOctokit('').git.createRef.mockResolvedValue({});
        getOctokit('').pulls.list.mockResolvedValue({ data: [] });
        getOctokit('').pulls.create.mockResolvedValue({});
        await run();
        expect(getOctokit('').git.createRef.mock.calls.length).toBe(1);
        expect(getOctokit('').repos.createOrUpdateFileContents.mock.calls.length).toBe(1);
        expect(getOctokit('').pulls.create.mock.calls.length).toBe(1);
        expect(setFailed.mock.calls.length).toBe(0);
    });
});
