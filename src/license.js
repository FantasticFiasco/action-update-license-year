const apache = require('./transforms/apache');
const bsd = require('./transforms/bsd');
const gnuAgpl3 = require('./transforms/gnuAgpl3');
const mit = require('./transforms/mit');

const TRANSFORMS = [gnuAgpl3, apache, bsd, mit];

/**
 * @param {string} license
 * @param {number} year
 */
function transformLicense(license, year) {
    for (const transform of TRANSFORMS) {
        if (transform.canTransform(license)) {
            return transform.transform(license, year);
        }
    }

    throw new Error('Specified license is not supported');
}

module.exports = {
    transformLicense,
};
