/**
 * @param {string[]} match
 * @param {number} year
 */
function isYearUnchanged(match, year) {
    const yearInLicense = Number(match[2]);
    return yearInLicense === year;
}

module.exports = {
    isYearUnchanged,
};
