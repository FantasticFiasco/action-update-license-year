// Regular expressions finding the copyright year(s) in GNU Affero General Public License v3.0 only
// (AGPL-3.0-only) license files
const GNU_AGPLv3_COPYRIGHT_YEAR = /(Copyright\s+\(C\)\s+)(\d{4})(?!\s+Free Software Foundation)(\s+\w+)/gm;
const GNU_AGPLv3_COPYRIGHT_YEAR_RANGE = /(Copyright\s+\(C\)\s+)(\d{4})-(\d{4})(?!\s+Free Software Foundation)(\s+\w+)/gm;

// Regular expressions finding the copyright year(s) in Apache 2.0 (Apache-2.0) license files
const APACHE_COPYRIGHT_YEAR = /(Copyright\s+)(\d{4})(\s+\w+)/gm;
const APACHE_COPYRIGHT_YEAR_RANGE = /(Copyright\s+)(\d{4})-(\d{4})(\s+\w+)/gm;

// Regular expressions finding the copyright year(s) in BSD 2-clause "Simplified" (BSD-2-Clause)
// and BSD 3-clause "New" or "Revised" (BSD-3-Clause) license files
const BSD_COPYRIGHT_YEAR = /(Copyright\s+\(c\)\s+)(\d{4})(,\s+\w+)/gm;
const BSD_COPYRIGHT_YEAR_RANGE = /(Copyright\s+\(c\)\s+)(\d{4})-(\d{4})(,\s+\w+)/gm;

// Regular expressions finding the copyright year(s) in MIT (MIT) license files
const MIT_COPYRIGHT_YEAR = /(Copyright\s+\(c\)\s+)(\d{4})(\s+\w+)/gm;
const MIT_COPYRIGHT_YEAR_RANGE = /(Copyright\s+\(c\)\s+)(\d{4})-(\d{4})(\s+\w+)/gm;

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
    // GNU Affero General Public License v3.0 only
    if (GNU_AGPLv3_COPYRIGHT_YEAR.test(license)) {
        return license.replace(GNU_AGPLv3_COPYRIGHT_YEAR, `$1$2-${year}$3`);
    }
    if (GNU_AGPLv3_COPYRIGHT_YEAR_RANGE.test(license)) {
        return license.replace(GNU_AGPLv3_COPYRIGHT_YEAR_RANGE, `$1$2-${year}$4`);
    }

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
