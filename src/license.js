const core = require("@actions/core");
const fs = require("fs");

// Regular expressions finding the copyright year(s) in Apache 2.0 license files
const copyrightYear = /(Copyright )(\d{4})( \w+)/gm;
const copyrightYearRange = /(Copyright )(\d{4})-(\d{4})( \w+)/gm;

/**
 * Update the copyright year(s) in a license file named LICENSE in the root of the repository.
 *
 * @returns {String}        The updated content of the license file.
 */
function update() {
    const fileName = "LICENSE";
    const newYear = new Date().getFullYear();
    return updateFile(fileName, newYear);
}

/**
 * Update the copyright year(s) in specified license file.
 *
 * @param {String} fileName The license file name.
 * @param {Number} year     The year the license is valid to.
 * @returns {String}        The updated content of the license file.
 */
function updateFile(fileName, year) {
    core.info(`Lets update copyright year(s) to "${year}" in licese file "${fileName}"`);

    let license = readLicenseFile(fileName);

    if (copyrightYear.test(license)) {
        core.info("About to update from a single year into a range of years");
        license = license.replace(copyrightYear, `$1$2-${year}$3`);
    } else if (copyrightYearRange.test(license)) {
        core.info("About to update a range of years");
        license = license.replace(copyrightYearRange, `$1$2-${year}$4`);
    } else {
        throw new Error(`Format of license file "${fileName}" is not supported`);
    }

    writeLicenseFile(fileName, license);

    return license;
}

function readLicenseFile(fileName) {
    core.info(`Read content of file "${fileName}"`);
    return fs.readFileSync(fileName).toString();
}

function writeLicenseFile(fileName, license) {
    core.info(`Write content to file "${fileName}"`);
    fs.writeFileSync(fileName, license);
}

module.exports = {
    update,
    updateFile
};
