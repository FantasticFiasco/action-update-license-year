// Module capable of transforming the following license files:
// - Apache 2.0 (Apache-2.0)

const { isYearUnchanged } = require('./utils');

const COPYRIGHT_YEAR = /(Copyright\s+)(\d{4})(\s+\w+)/m;
const COPYRIGHT_YEARS = /(Copyright\s+)(\d{4})-(\d{4})(\s+\w+)/m;

/**
 * @param {string} license
 */
function canTransform(license) {
    return COPYRIGHT_YEAR.test(license) || COPYRIGHT_YEARS.test(license);
}

/**
 * @param {string} license
 * @param {number} year
 */
function transform(license, year) {
    const match = COPYRIGHT_YEAR.exec(license);
    if (match !== null) {
        if (isYearUnchanged(match, year)) {
            return license;
        }
        return license.replace(COPYRIGHT_YEAR, `$1$2-${year}$3`);
    }
    if (COPYRIGHT_YEARS.test(license)) {
        return license.replace(COPYRIGHT_YEARS, `$1$2-${year}$4`);
    }

    throw new Error('Transforming Apache-2.0 license failed');
}

module.exports = {
    canTransform,
    transform,
};
