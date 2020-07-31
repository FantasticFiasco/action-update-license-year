// Module capable of transforming the following license files:
// - MIT (MIT)

const REGEXP = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}/im;

/**
 * @param {string} license
 */
function canTransform(license) {
    return REGEXP.test(license);
}

/**
 * @param {string} license
 * @param {number} currentYear
 */
function transform(license, currentYear) {
    const match = REGEXP.exec(license);
    if (match === null || match.groups === undefined) {
        throw new Error('Transforming MIT license failed');
    }

    const from = match.groups['from'];
    const to = match.groups['to'];

    return license.replace(REGEXP, `$<from>-${currentYear}`);
}

module.exports = {
    canTransform,
    transform,
};
