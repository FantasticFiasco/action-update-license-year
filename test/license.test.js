const fs = require('fs');
import { License } from '../src/license';

test('updates Apache 2.0 license from a single year into a range of years', () => {
    const got = new License().updateToYear(readTestFile('apache-2.0/SINGLE_YEAR'), 1001);
    const want = readTestFile('apache-2.0/SINGLE_YEAR_EXPECTED');
    expect(got).toBe(want);
});

test('updates Apache 2.0 license from a range of years into a new range of years', () => {
    const got = new License().updateToYear(readTestFile('apache-2.0/RANGE_OF_YEARS'), 2001);
    const want = readTestFile('apache-2.0/RANGE_OF_YEARS_EXPECTED');
    expect(got).toBe(want);
});

test('updates BSD 2-clause "Simplified" license from a single year into a range of years', () => {
    const got = new License().updateToYear(readTestFile('bsd-2-clause/SINGLE_YEAR'), 1001);
    const want = readTestFile('bsd-2-clause/SINGLE_YEAR_EXPECTED');
    expect(got).toBe(want);
});

test('updates BSD 2-clause "Simplified" license from a range of years into a new range of years', () => {
    const got = new License().updateToYear(readTestFile('bsd-2-clause/RANGE_OF_YEARS'), 2001);
    const want = readTestFile('bsd-2-clause/RANGE_OF_YEARS_EXPECTED');
    expect(got).toBe(want);
});

test('updates BSD 3-clause "New" or "Revised" license from a single year into a range of years', () => {
    const got = new License().updateToYear(readTestFile('bsd-3-clause/SINGLE_YEAR'), 1001);
    const want = readTestFile('bsd-3-clause/SINGLE_YEAR_EXPECTED');
    expect(got).toBe(want);
});

test('updates BSD 3-clause "New" or "Revised" license from a range of years into a new range of years', () => {
    const got = new License().updateToYear(readTestFile('bsd-3-clause/RANGE_OF_YEARS'), 2001);
    const want = readTestFile('bsd-3-clause/RANGE_OF_YEARS_EXPECTED');
    expect(got).toBe(want);
});

test('updates MIT license from a single year into a range of years', () => {
    const got = new License().updateToYear(readTestFile('mit/SINGLE_YEAR'), 1001);
    const want = readTestFile('mit/SINGLE_YEAR_EXPECTED');
    expect(got).toBe(want);
});

test('updates MIT license from a range of years into a new range of years', () => {
    const got = new License().updateToYear(readTestFile('mit/RANGE_OF_YEARS'), 2001);
    const want = readTestFile('mit/RANGE_OF_YEARS_EXPECTED');
    expect(got).toBe(want);
});

test('throws error given unsupported license', () => {
    const fn = () => new License().update('invalid license file');
    expect(fn).toThrow();
});

/**
 * @param {string} fileName
 */
function readTestFile(fileName) {
    return fs.readFileSync(`./test/${fileName}`).toString();
}
