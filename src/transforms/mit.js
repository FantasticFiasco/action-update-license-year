const MIT_SINGLE_YEAR = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})(?!-\d{4})/im;
const MIT_YEAR_RANGE = /(?<=copyright\s+\(c\)\s+)(?<from>\d{4})-\d{4}/im;

module.exports = {
    MIT_SINGLE_YEAR,
    MIT_YEAR_RANGE,
};
