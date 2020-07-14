// Regular expressions finding the copyright year(s) in Apache 2.0 license files
const APACHE_COPYRIGHT_YEAR = /(Copyright )(\d{4})( \w+)/gm;
const APACHE_COPYRIGHT_YEAR_RANGE = /(Copyright )(\d{4})-(\d{4})( \w+)/gm;

// Regular expressions finding the copyright year(s) in BSD 2-clause "Simplified" and
// BSD 3-clause "New" or "Revised" license files
const BSD_COPYRIGHT_YEAR = /(Copyright \(c\) )(\d{4})(, \w+)/gm;
const BSD_COPYRIGHT_YEAR_RANGE = /(Copyright \(c\) )(\d{4})-(\d{4})(, \w+)/gm;

// Regular expressions finding the copyright year(s) in MIT license files
const MIT_COPYRIGHT_YEAR = /(Copyright \(c\) )(\d{4})( \w+)/gm;
const MIT_COPYRIGHT_YEAR_RANGE = /(Copyright \(c\) )(\d{4})-(\d{4})( \w+)/gm;

/**
 * @param {string} license
 */
function updateLicense(license) {
    const currentYear = new Date().getFullYear();
    return updateLicenseToYear(license, currentYear);
}

/**
 * @param {string} license
 * @param {number} year
 */
function updateLicenseToYear(license, year) {
    // Apache 2.0
    if (APACHE_COPYRIGHT_YEAR.test(license)) {
        return license.replace(APACHE_COPYRIGHT_YEAR, `$1$2-${year}$3`);
    }
    if (APACHE_COPYRIGHT_YEAR_RANGE.test(license)) {
        return license.replace(APACHE_COPYRIGHT_YEAR_RANGE, `$1$2-${year}$4`);
    }

    // BSD 2-clause "Simplified"
    // BSD 3-clause "New" or "Revised"
    if (BSD_COPYRIGHT_YEAR.test(license)) {
        return license.replace(BSD_COPYRIGHT_YEAR, `$1$2-${year}$3`);
    }
    if (BSD_COPYRIGHT_YEAR_RANGE.test(license)) {
        return license.replace(BSD_COPYRIGHT_YEAR_RANGE, `$1$2-${year}$4`);
    }

    // MIT
    if (MIT_COPYRIGHT_YEAR.test(license)) {
        return license.replace(MIT_COPYRIGHT_YEAR, `$1$2-${year}$3`);
    }
    if (MIT_COPYRIGHT_YEAR_RANGE.test(license)) {
        return license.replace(MIT_COPYRIGHT_YEAR_RANGE, `$1$2-${year}$4`);
    }

    throw new Error('Specified license is not supported');
}

module.exports = {
    updateLicense,
    updateLicenseToYear,
};
