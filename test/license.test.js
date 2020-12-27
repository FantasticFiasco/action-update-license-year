const fs = require('fs');
const { applyTransform: transformLicense } = require('../src/transforms');

describe('#transformLicense should', () => {
    describe('given AGPL-3.0-only', () => {
        test('transform license from a single year into a range of years', () => {
            const got = transformLicense(readTestFile('AGPL-3.0-only/SINGLE_YEAR'), 2002);
            const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = transformLicense(readTestFile('AGPL-3.0-only/RANGE_OF_YEARS'), 2002);
            const want = readTestFile('AGPL-3.0-only/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = transformLicense(readTestFile('AGPL-3.0-only/SINGLE_YEAR'), 2000);
            const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given Apache-2.0', () => {
        test('transform license from a single year into a range of years', () => {
            const got = transformLicense(readTestFile('Apache-2.0/SINGLE_YEAR'), 2002);
            const want = readTestFile('Apache-2.0/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = transformLicense(readTestFile('Apache-2.0/RANGE_OF_YEARS'), 2002);
            const want = readTestFile('Apache-2.0/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = transformLicense(readTestFile('Apache-2.0/SINGLE_YEAR'), 2000);
            const want = readTestFile('Apache-2.0/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given BSD-2-Clause', () => {
        test('transform license from a single year into a range of years', () => {
            const got = transformLicense(readTestFile('BSD-2-Clause/SINGLE_YEAR'), 2002);
            const want = readTestFile('BSD-2-Clause/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = transformLicense(readTestFile('BSD-2-Clause/RANGE_OF_YEARS'), 2002);
            const want = readTestFile('BSD-2-Clause/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = transformLicense(readTestFile('BSD-2-Clause/SINGLE_YEAR'), 2000);
            const want = readTestFile('BSD-2-Clause/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given BSD-3-Clause', () => {
        test('transform license from a single year into a range of years', () => {
            const got = transformLicense(readTestFile('BSD-3-Clause/SINGLE_YEAR'), 2002);
            const want = readTestFile('BSD-3-Clause/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = transformLicense(readTestFile('BSD-3-Clause/RANGE_OF_YEARS'), 2002);
            const want = readTestFile('BSD-3-Clause/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = transformLicense(readTestFile('BSD-3-Clause/SINGLE_YEAR'), 2000);
            const want = readTestFile('BSD-3-Clause/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given MIT', () => {
        test('transform license from a single year into a range of years', () => {
            const got = transformLicense(readTestFile('MIT/SINGLE_YEAR'), 2002);
            const want = readTestFile('MIT/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = transformLicense(readTestFile('MIT/RANGE_OF_YEARS'), 2002);
            const want = readTestFile('MIT/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = transformLicense(readTestFile('MIT/SINGLE_YEAR'), 2000);
            const want = readTestFile('MIT/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    test('throw error given unsupported license format', () => {
        const fn = () => transformLicense('unsupported license format', 2002);
        expect(fn).toThrow();
    });
});

/**
 * @param {string} fileName
 */
function readTestFile(fileName) {
    return fs.readFileSync(`./test/${fileName}`).toString();
}
