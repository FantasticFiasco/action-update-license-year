const fs = require("fs");

const copyrightYear = /(Copyright )(\d{4})( \w+)/gm;
const copyrightYearRange = /(Copyright )(\d{4})-(\d{4})( \w+)/gm;

function update() {
    const fileName = "LICENSE";
    const newYear = new Date().getFullYear();
    return updateFile(fileName, newYear);
}

function updateFile(fileName, year) {
    let license = readLicenseFile(fileName);

    if (copyrightYear.test(license)) {
        // Turn a single year into a range of years
        license = license.replace(copyrightYear, `$1$2-${year}$3`);
    } else if (copyrightYearRange.test(license)) {
        // Update the range of years
        license = license.replace(copyrightYearRange, `$1$2-${year}$4`);
    } else {
        throw new Error(`Format of license file ${fileName} is not supported`);
    }

    writeLicenseFile(fileName, license);

    return license;
}

function readLicenseFile(fileName) {
    return fs.readFileSync(fileName).toString();
}

function writeLicenseFile(fileName, license) {
    fs.writeFileSync(fileName, license);
}

module.exports = {
    update,
    updateFile
};
