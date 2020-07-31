const apache = require('./transforms/apache');
const bsd = require('./transforms/bsd');
const gnuAgpl3 = require('./transforms/gnuAgpl3');
const mitSingleYear = require('./transforms/mit-single-year');
const mitYearRange = require('./transforms/mit-year-range');

const TRANSFORMS = [gnuAgpl3, apache, bsd, mitSingleYear, mitYearRange];

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transformLicense(license, currentYear) {
    for (const transform of TRANSFORMS) {
        if (transform.canTransform(license)) {
            return transform.transform(license, currentYear);
        }
    }

    throw new Error('Specified license is not supported');
}

module.exports = {
    transformLicense,
};
