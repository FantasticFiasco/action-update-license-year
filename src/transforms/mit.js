// Module capable of transforming the following license files:
// - MIT (MIT)

const COPYRIGHT_YEAR = /(?<=copyright\s+\(c\)\s+)\d{4}(?!-\d{4})/im;
const COPYRIGHT_YEARS = /(?<=copyright\s+\(c\)\s+\d{4}-)\d{4}/im;

/**
 * @param {string} license
 */
function canTransform(license) {
    return COPYRIGHT_YEAR.test(license) || COPYRIGHT_YEARS.test(license);
}

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transform(license, currentYear) {
    let match = COPYRIGHT_YEAR.exec(license);
    if (match !== null) {
        if (Number(match[0]) === currentYear) {
            return license;
        }

        return license.replace(COPYRIGHT_YEAR, `$&-${currentYear}`);
    }

    match = COPYRIGHT_YEARS.exec(license);
    if (match !== null) {
        return license.replace(COPYRIGHT_YEARS, `${currentYear}`);
    }

    throw new Error('Transforming MIT license failed');
}

module.exports = {
    canTransform,
    transform,
};
