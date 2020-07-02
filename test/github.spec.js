import { parseRepoPath } from '../src/github';

test('successfully parses a GitHub repository name based on lowercase letters', () => {
    const got = parseRepoPath('abc/def');
    const want = { owner: 'abc', repo: 'def' };
    expect(got).toStrictEqual(want);
});

test('successfully parses a GitHub repository name based on uppercase letters', () => {
    const got = parseRepoPath('ABC/DEF');
    const want = { owner: 'ABC', repo: 'DEF' };
    expect(got).toStrictEqual(want);
});

test('successfully parses a GitHub repository name based on numbers', () => {
    const got = parseRepoPath('012/345');
    const want = { owner: '012', repo: '345' };
    expect(got).toStrictEqual(want);
});

test('successfully parses a GitHub repository name containing hyphens', () => {
    const got = parseRepoPath('a-0/b-1');
    const want = { owner: 'a-0', repo: 'b-1' };
    expect(got).toStrictEqual(want);
});
