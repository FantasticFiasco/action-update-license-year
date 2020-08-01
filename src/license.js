// Regular expressions capable of transforming the following license files:
// - GNU Affero General Public License v3.0 only (AGPL-3.0-only)
const AGPL_3_ONLY_YEAR_RANGE = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}(?!\s+free software foundation)/im;
const AGPL_3_ONLY_SINGLE_YEAR = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})(?!\s+free software foundation)/im;

// Regular expressions capable of transforming the following license files:
// - Apache 2.0 (Apache-2.0)
const APACHE_2_YEAR_RANGE = /(?<=copyright\s+)(?<from>\d{4})-\d{4}/im;
const APACHE_2_SINGLE_YEAR = /(?<=copyright\s+)(?<from>\d{4})/im;

// Regular expressions capable of transforming the following license files:
// - BSD 2-clause "Simplified" (BSD-2-Clause)
// - BSD 3-clause "New" or "Revised" (BSD-3-Clause)
const BSD_YEAR_RANGE = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}(?=,)/im;
const BSD_SINGLE_YEAR = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})(?=,)/im;

// Regular expressions capable of transforming the following license files:
// - MIT (MIT)
const MIT_YEAR_RANGE = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}/im;
const MIT_SINGLE_YEAR = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})/im;

/**
 * @typedef LicenseTransform
 * @property {string} name
 * @property {RegExp} transform
 */
const LICESE_TRANSFORMS = [
    { name: 'AGPL-3.0-only', transform: AGPL_3_ONLY_YEAR_RANGE },
    { name: 'AGPL-3.0-only', transform: AGPL_3_ONLY_SINGLE_YEAR },
    { name: 'Apache-2.0', transform: APACHE_2_YEAR_RANGE },
    { name: 'Apache-2.0', transform: APACHE_2_SINGLE_YEAR },
    { name: 'BSD-2-Clause/BSD-3-Clause', transform: BSD_YEAR_RANGE },
    { name: 'BSD-2-Clause/BSD-3-Clause', transform: BSD_SINGLE_YEAR },
    { name: 'MIT', transform: MIT_YEAR_RANGE },
    { name: 'MIT', transform: MIT_SINGLE_YEAR },
];

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transformLicense(license, currentYear) {
    for (const licenseTransform of LICESE_TRANSFORMS) {
        if (canTransform(licenseTransform, license)) {
            return transform(licenseTransform, license, currentYear);
        }
    }

    throw new Error('Specified license is not supported');
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 */
function canTransform(licenseTransform, license) {
    return licenseTransform.transform.test(license);
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 * @param {number} currentYear
 */
function transform(licenseTransform, license, currentYear) {
    const match = licenseTransform.transform.exec(license);
    if (match === null || match.groups === undefined) {
        throw new Error(`Transforming ${licenseTransform.name} license failed`);
    }

    if (Number(match.groups['from']) === currentYear) {
        return license;
    }

    return license.replace(licenseTransform.transform, `$<from>-${currentYear}`);
}

module.exports = {
    transformLicense,
};
