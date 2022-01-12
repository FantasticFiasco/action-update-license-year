const { readFileSync } = require('fs');
const { applyTransform } = require('../src/transforms');

describe('#applyTransform should', () => {
    const defaultTransform = '';
    const defaultFileName = 'LICENSE';

    describe('given AGPL-3.0-only', () => {
        test('transform license from a single year into a range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('AGPL-3.0-only/SINGLE_YEAR'),
                2002,
                defaultFileName
            );
            const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('AGPL-3.0-only/RANGE_OF_YEARS'),
                2002,
                defaultFileName
            );
            const want = readTestFile('AGPL-3.0-only/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('AGPL-3.0-only/SINGLE_YEAR'),
                2000,
                defaultFileName
            );
            const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given Apache-2.0', () => {
        test('transform license from a single year into a range of years', () => {
            const got = applyTransform(defaultTransform, readTestFile('Apache-2.0/SINGLE_YEAR'), 2002, defaultFileName);
            const want = readTestFile('Apache-2.0/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('Apache-2.0/RANGE_OF_YEARS'),
                2002,
                defaultFileName
            );
            const want = readTestFile('Apache-2.0/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = applyTransform(defaultTransform, readTestFile('Apache-2.0/SINGLE_YEAR'), 2000, defaultFileName);
            const want = readTestFile('Apache-2.0/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given BSD-2-Clause', () => {
        test('transform license from a single year into a range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-2-Clause/SINGLE_YEAR'),
                2002,
                defaultFileName
            );
            const want = readTestFile('BSD-2-Clause/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-2-Clause/RANGE_OF_YEARS'),
                2002,
                defaultFileName
            );
            const want = readTestFile('BSD-2-Clause/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-2-Clause/SINGLE_YEAR'),
                2000,
                defaultFileName
            );
            const want = readTestFile('BSD-2-Clause/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given BSD-3-Clause', () => {
        test('transform license from a single year into a range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-3-Clause/SINGLE_YEAR'),
                2002,
                defaultFileName
            );
            const want = readTestFile('BSD-3-Clause/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-3-Clause/RANGE_OF_YEARS'),
                2002,
                defaultFileName
            );
            const want = readTestFile('BSD-3-Clause/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = applyTransform(
                defaultTransform,
                readTestFile('BSD-3-Clause/SINGLE_YEAR'),
                2000,
                defaultFileName
            );
            const want = readTestFile('BSD-3-Clause/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given MIT', () => {
        test('transform license from a single year into a range of years', () => {
            const got = applyTransform(defaultTransform, readTestFile('MIT/SINGLE_YEAR'), 2002, defaultFileName);
            const want = readTestFile('MIT/SINGLE_YEAR_EXPECTED');
            expect(got).toBe(want);
        });

        test('transform license from a range of years into a new range of years', () => {
            const got = applyTransform(defaultTransform, readTestFile('MIT/RANGE_OF_YEARS'), 2002, defaultFileName);
            const want = readTestFile('MIT/RANGE_OF_YEARS_EXPECTED');
            expect(got).toBe(want);
        });

        test('not transform license from a single year given year is unchanged', () => {
            const got = applyTransform(defaultTransform, readTestFile('MIT/SINGLE_YEAR'), 2000, defaultFileName);
            const want = readTestFile('MIT/SINGLE_YEAR');
            expect(got).toBe(want);
        });
    });

    describe('given custom transform', () => {
        test('transform license', () => {
            const got = applyTransform(
                '(?<=some copyright )(?<from>\\d{4})-\\d{4}',
                'some copyright 2000-2001',
                2002,
                defaultFileName
            );
            const want = 'some copyright 2000-2002';
            expect(got).toBe(want);
        });
    });

    test('throw error given unsupported license format', () => {
        const fn = () => applyTransform(defaultTransform, 'unsupported license format', 2002, defaultFileName);
        expect(fn).toThrow();
    });
});

/**
 * @param {string} fileName
 */
function readTestFile(fileName) {
    return readFileSync(`./test/testdata/licenses/${fileName}`).toString();
}
