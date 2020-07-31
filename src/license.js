const apache = require('./transforms/apache');
const bsd = require('./transforms/bsd');
const gnuAgpl3 = require('./transforms/gnuAgpl3');
const mit = require('./transforms/mit');

const OLD_TRANSFORMS = [gnuAgpl3, apache, bsd];
const TRANSFORMS = [mit.MIT_SINGLE_YEAR, mit.MIT_YEAR_RANGE];

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

    for (const transform of TRANSFORMS) {
        if (canTransform(transform, license)) {
            return doTransform(transform, license, currentYear);
        }
    }

    throw new Error('Specified license is not supported');
}

/**
 * @param {RegExp} transform
 * @param {string} license
 */
function canTransform(transform, license) {
    return transform.test(license);
}

/**
 * @param {RegExp} transform
 * @param {string} license
 * @param {number} currentYear
 */
function doTransform(transform, license, currentYear) {
    const match = transform.exec(license);
    if (match === null || match.groups === undefined) {
        // TODO: Before, logging stated license, lets re-introduce that again
        throw new Error('Transforming license failed');
    }

    if (Number(match.groups['from']) === currentYear) {
        return license;
    }

    return license.replace(transform, `$<from>-${currentYear}`);
}

module.exports = {
    transformLicense,
};
