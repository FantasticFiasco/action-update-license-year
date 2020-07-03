import { getEnvironmentVariable, parseRepoPath } from '../src/arguments';

describe('#getEnvironmentVariable', () => {
    test('successfully returns an environment variable', () => {
        const got = getEnvironmentVariable('NODE_ENV');
        const want = 'test';
        expect(got).toBe(want);
    });

    test('throws error when environment variable is unset', () => {
        const act = () => getEnvironmentVariable('UNSET_VARIABLE');
        expect(act).toThrow();
    });
});

describe('#parseRepoPath', () => {
    test('successfully parses a GitHub repository path based on lowercase letters', () => {
        const got = parseRepoPath('abc/def');
        const want = { owner: 'abc', name: 'def' };
        expect(got).toStrictEqual(want);
    });

    test('successfully parses a GitHub repository path based on uppercase letters', () => {
        const got = parseRepoPath('ABC/DEF');
        const want = { owner: 'ABC', name: 'DEF' };
        expect(got).toStrictEqual(want);
    });

    test('successfully parses a GitHub repository path based on numbers', () => {
        const got = parseRepoPath('012/345');
        const want = { owner: '012', name: '345' };
        expect(got).toStrictEqual(want);
    });

    test('successfully parses a GitHub repository path containing hyphens', () => {
        const got = parseRepoPath('a-0/b-1');
        const want = { owner: 'a-0', name: 'b-1' };
        expect(got).toStrictEqual(want);
    });

    test('throws error when parsing GitHub repository path with no owner', () => {
        const act = () => parseRepoPath('/repo');
        expect(act).toThrow();
    });

    test('throws error when parsing GitHub repository path with no repo', () => {
        const act = () => parseRepoPath('owner/');
        expect(act).toThrow();
    });
});
