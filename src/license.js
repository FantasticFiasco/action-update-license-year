export class License {
    constructor() {
        // Regular expressions finding the copyright year(s) in Apache 2.0 license files
        this.apacheCopyrightYear = /(Copyright )(\d{4})( \w+)/gm;
        this.apacheCopyrightYearRange = /(Copyright )(\d{4})-(\d{4})( \w+)/gm;

        // Regular expressions finding the copyright year(s) in BSD 2-clause "Simplified" and
        // BSD 3-clause "New" or "Revised" license files
        this.bsdCopyrightYear = /(Copyright \(c\) )(\d{4})(, \w+)/gm;
        this.bsdCopyrightYearRange = /(Copyright \(c\) )(\d{4})-(\d{4})(, \w+)/gm;

        // Regular expressions finding the copyright year(s) in MIT license files
        this.mitCopyrightYear = /(Copyright \(c\) )(\d{4})( \w+)/gm;
        this.mitCopyrightYearRange = /(Copyright \(c\) )(\d{4})-(\d{4})( \w+)/gm;
    }

    update(license) {
        const currentYear = new Date().getFullYear();
        return this.updateToYear(license, currentYear);
    }

    updateToYear(license, year) {
        // Apache 2.0
        if (this.apacheCopyrightYear.test(license)) {
            return license.replace(this.apacheCopyrightYear, `$1$2-${year}$3`);
        }
        if (this.apacheCopyrightYearRange.test(license)) {
            return license.replace(this.apacheCopyrightYearRange, `$1$2-${year}$4`);
        }

        // BSD 2-clause "Simplified"
        // BSD 3-clause "New" or "Revised"
        if (this.bsdCopyrightYear.test(license)) {
            return license.replace(this.bsdCopyrightYear, `$1$2-${year}$3`);
        }
        if (this.bsdCopyrightYearRange.test(license)) {
            return license.replace(this.bsdCopyrightYearRange, `$1$2-${year}$4`);
        }

        // MIT
        if (this.mitCopyrightYear.test(license)) {
            return license.replace(this.mitCopyrightYear, `$1$2-${year}$3`);
        }
        if (this.mitCopyrightYearRange.test(license)) {
            return license.replace(this.mitCopyrightYearRange, `$1$2-${year}$4`);
        }

        throw new Error("Specified license is not supported");
    }
}
