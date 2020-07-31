// Module capable of transforming the following license files:
// - MIT (MIT)

const COPYRIGHT_YEARS = /(?<=copyright\s+\(c\)\s+\d{4}-)\d{4}/im;

/**
 * @param {string} license
 */
function canTransform(license) {
    return COPYRIGHT_YEARS.test(license);
}

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transform(license, currentYear) {
    const match = COPYRIGHT_YEARS.exec(license);
    if (match !== null) {
        return license.replace(COPYRIGHT_YEARS, `${currentYear}`);
    }

    throw new Error('Transforming MIT license failed');
}

module.exports = {
    canTransform,
    transform,
};
