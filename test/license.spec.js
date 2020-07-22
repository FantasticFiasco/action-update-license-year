const fs = require('fs');
const { updateLicense, updateLicenseToYear } = require('../src/license');

describe('#update should', () => {
    test('throw error given unsupported license format', () => {
        const fn = () => updateLicense('unsupported license format');
        expect(fn).toThrow();
    });
});

describe('#updateToYear should', () => {
    test('update GNU Affero General Public License v3.0 only license from a single year into a range of years', () => {
        const got = updateLicenseToYear(readTestFile('AGPL-3.0-only/SINGLE_YEAR'), 2002);
        const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR_EXPECTED');
        expect(got).toBe(want);
    });

    test('not update GNU Affero General Public License v3.0 only license from a single year given year is unchanged', () => {
        const got = updateLicenseToYear(readTestFile('AGPL-3.0-only/SINGLE_YEAR'), 2000);
        const want = readTestFile('AGPL-3.0-only/SINGLE_YEAR');
        expect(got).toBe(want);
    });

    test('update GNU Affero General Public License v3.0 only license from a range of years into a new range of years', () => {
        const got = updateLicenseToYear(readTestFile('AGPL-3.0-only/RANGE_OF_YEARS'), 2002);
        const want = readTestFile('AGPL-3.0-only/RANGE_OF_YEARS_EXPECTED');
        expect(got).toBe(want);
    });

    test('update Apache 2.0 license from a single year into a range of years', () => {
        const got = updateLicenseToYear(readTestFile('Apache-2.0/SINGLE_YEAR'), 2002);
        const want = readTestFile('Apache-2.0/SINGLE_YEAR_EXPECTED');
        expect(got).toBe(want);
    });

    test('not update Apache 2.0 license from a single year given year is unchanged', () => {
        const got = updateLicenseToYear(readTestFile('Apache-2.0/SINGLE_YEAR'), 2000);
        const want = readTestFile('Apache-2.0/SINGLE_YEAR');
        expect(got).toBe(want);
    });

    test('update Apache 2.0 license from a range of years into a new range of years', () => {
        const got = updateLicenseToYear(readTestFile('Apache-2.0/RANGE_OF_YEARS'), 2002);
        const want = readTestFile('Apache-2.0/RANGE_OF_YEARS_EXPECTED');
        expect(got).toBe(want);
    });

    test('update BSD 2-clause "Simplified" license from a single year into a range of years', () => {
        const got = updateLicenseToYear(readTestFile('BSD-2-Clause/SINGLE_YEAR'), 2002);
        const want = readTestFile('BSD-2-Clause/SINGLE_YEAR_EXPECTED');
        expect(got).toBe(want);
    });

    test('not update BSD 2-clause "Simplified" license from a single year given year is unchanged', () => {
        const got = updateLicenseToYear(readTestFile('BSD-2-Clause/SINGLE_YEAR'), 2000);
        const want = readTestFile('BSD-2-Clause/SINGLE_YEAR');
        expect(got).toBe(want);
    });

    test('update BSD 2-clause "Simplified" license from a range of years into a new range of years', () => {
        const got = updateLicenseToYear(readTestFile('BSD-2-Clause/RANGE_OF_YEARS'), 2002);
        const want = readTestFile('BSD-2-Clause/RANGE_OF_YEARS_EXPECTED');
        expect(got).toBe(want);
    });

    test('update BSD 3-clause "New" or "Revised" license from a single year into a range of years', () => {
        const got = updateLicenseToYear(readTestFile('BSD-3-Clause/SINGLE_YEAR'), 2002);
        const want = readTestFile('BSD-3-Clause/SINGLE_YEAR_EXPECTED');
        expect(got).toBe(want);
    });

    test('not update BSD 3-clause "New" or "Revised" license from a single year given year is unchanged', () => {
        const got = updateLicenseToYear(readTestFile('BSD-3-Clause/SINGLE_YEAR'), 2000);
        const want = readTestFile('BSD-3-Clause/SINGLE_YEAR');
        expect(got).toBe(want);
    });

    test('update BSD 3-clause "New" or "Revised" license from a range of years into a new range of years', () => {
        const got = updateLicenseToYear(readTestFile('BSD-3-Clause/RANGE_OF_YEARS'), 2002);
        const want = readTestFile('BSD-3-Clause/RANGE_OF_YEARS_EXPECTED');
        expect(got).toBe(want);
    });

    test('update MIT license from a single year into a range of years', () => {
        const got = updateLicenseToYear(readTestFile('MIT/SINGLE_YEAR'), 2002);
        const want = readTestFile('MIT/SINGLE_YEAR_EXPECTED');
        expect(got).toBe(want);
    });

    test('not update MIT license from a single year given year is unchanged', () => {
        const got = updateLicenseToYear(readTestFile('MIT/SINGLE_YEAR'), 2000);
        const want = readTestFile('MIT/SINGLE_YEAR');
        expect(got).toBe(want);
    });

    test('update MIT license from a range of years into a new range of years', () => {
        const got = updateLicenseToYear(readTestFile('MIT/RANGE_OF_YEARS'), 2002);
        const want = readTestFile('MIT/RANGE_OF_YEARS_EXPECTED');
        expect(got).toBe(want);
    });

    test('throw error given unsupported license format', () => {
        const fn = () => updateLicenseToYear('unsupported license format', 2002);
        expect(fn).toThrow();
    });
});

/**
 * @param {string} fileName
 */
function readTestFile(fileName) {
    return fs.readFileSync(`./test/${fileName}`).toString();
}
