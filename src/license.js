const apache = require('./transforms/apache');
const bsd = require('./transforms/bsd');
const gnuAgpl3 = require('./transforms/gnuAgpl3');

// Module capable of transforming the following license files:
// - MIT (MIT)
const MIT_SINGLE_YEAR = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})(?!-\d{4})/im;
const MIT_YEAR_RANGE = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}/im;

const OLD_TRANSFORMS = [gnuAgpl3, apache, bsd];

/**
 * @typedef LicenseTransform
 * @property {string} name
 * @property {RegExp} transform
 */
const LICESE_TRANSFORMS = [
    { name: 'MIT', transform: MIT_SINGLE_YEAR },
    { name: 'MIT', transform: MIT_YEAR_RANGE },
];

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transformLicense(license, currentYear) {
    for (const transform of OLD_TRANSFORMS) {
        if (transform.canTransform(license)) {
            return transform.transform(license, currentYear);
        }
    }

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
