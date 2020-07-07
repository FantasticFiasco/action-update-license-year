jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        },
    },
}));

import { run } from '../src/action-update-license-year';

describe('license file', () => {
    test("is updated given branch doesn't not exist", async () => {
        await run();
    });
});
