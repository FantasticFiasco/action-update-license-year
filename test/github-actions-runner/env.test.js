const { existsSync } = require('fs');
const { ci, runnerTemp } = require('../../src/github-actions-runner/env');

describe('#runnerTemp should', () => {
    test('return an existing directory', () => {
        const got = runnerTemp;
        if (ci) {
            expect(got).toBeDefined();
            expect(existsSync(got || '')).toBeTruthy();
        } else {
            expect(got).toBeUndefined();
        }
    });
});
