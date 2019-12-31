export class License {
    constructor() {
        // Regular expressions finding the copyright year(s) in Apache 2.0 license files
        this.copyrightYear = /(Copyright )(\d{4})( \w+)/gm;
        this.copyrightYearRange = /(Copyright )(\d{4})-(\d{4})( \w+)/gm;
    }

    update(license) {
        const currentYear = new Date().getFullYear();
        return this.updateToYear(license, currentYear);
    }

    updateToYear(license, year) {
        if (this.copyrightYear.test(license)) {
            license = license.replace(this.copyrightYear, `$1$2-${year}$3`);
        } else if (this.copyrightYearRange.test(license)) {
            license = license.replace(this.copyrightYearRange, `$1$2-${year}$4`);
        } else {
            throw new Error("Specified license is not supported");
        }

        return license;
    }
}
