// Module capable of transforming the following license files:
// - BSD 2-clause "Simplified" (BSD-2-Clause)
// - BSD 3-clause "New" or "Revised" (BSD-3-Clause)

const { isYearUnchanged } = require('./utils');

const COPYRIGHT_YEAR = /(Copyright\s+\(c\)\s+)(\d{4})(,\s+\w+)/m;
const COPYRIGHT_YEARS = /(Copyright\s+\(c\)\s+)(\d{4})-(\d{4})(,\s+\w+)/m;

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

    throw new Error('Transforming BSD-2-Clause or BSD-3-Clause license failed');
}

module.exports = {
    canTransform,
    transform,
};
