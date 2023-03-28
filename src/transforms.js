// Regular expressions capable of transforming the following license files:
// - GNU Affero General Public License v3.0 only (AGPL-3.0-only)
// prettier-ignore
const AGPL_3_ONLY = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (C) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '(-\\d{4})?'                              +  // '(-YYYY)?'
    '(?!\\s+free\\s+software\\s+foundation)',    // ' Free Software Foundation'  negative lookahead
    'gmi'                                        // Global/Multi-line/Insensitive
);

// Regular expressions capable of transforming the following license files:
// - Apache 2.0 (Apache-2.0)
// - MIT (MIT)
// prettier-ignore
const APACHE_2_MIT = new RegExp(
    '(?<=copyright\\s+)'                      +  // 'Copyright '                 positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '(-\\d{4})?',                                // '(-YYYY)?'
    'gmi'                                        // Global/Multi-line/Insensitive
);

// Regular expressions capable of transforming the following license files:
// - BSD 2-clause "Simplified" (BSD-2-Clause)
// - BSD 3-clause "New" or "Revised" (BSD-3-Clause)
// prettier-ignore
const BSD = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (c) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '(-\\d{4})?'                              +  // '(-YYYY)?'
    '(?=,)',                                     // ','                          positive lookahead
    'gmi'                                        // Global/Multi-line/Insensitive
)

/**
 * @typedef LicenseTransform
 * @property {string} name
 * @property {RegExp} transform
 */
const DEFAULT_LICENSE_TRANSFORMS = [
    { name: 'AGPL-3.0-only', transform: AGPL_3_ONLY },
    { name: 'Apache-2.0', transform: APACHE_2_MIT },
    { name: 'BSD-2-Clause/BSD-3-Clause/MIT', transform: BSD },
]

/**
 * @param {string} transform
 * @param {string} license
 * @param {number} currentYear
 * @param {string} fileName
 */
const applyTransform = (transform, license, currentYear, fileName) => {
    return transform === ''
        ? applyDefaultTransform(license, currentYear, fileName)
        : applyCustomTransform(transform, license, currentYear, fileName)
}

/**
 * @param {string} license
 * @param {number} currentYear
 * @param {string} fileName
 */
const applyDefaultTransform = (license, currentYear, fileName) => {
    for (const licenseTransform of DEFAULT_LICENSE_TRANSFORMS) {
        if (canApplyLicenseTransform(licenseTransform, license)) {
            return applyLicenseTransform(licenseTransform, license, currentYear)
        }
    }

    throw new Error(`Default transform is not valid on "${fileName}"`)
}

/**
 * @param {string} transform
 * @param {string} license
 * @param {number} currentYear
 * @param {string} fileName
 */
const applyCustomTransform = (transform, license, currentYear, fileName) => {
    const licenseTransform = {
        name: 'Custom',
        transform: new RegExp(transform, 'gmi'),
    }

    if (!canApplyLicenseTransform(licenseTransform, license)) {
        throw new Error(`Custom transform "${transform}" is not valid on "${fileName}"`)
    }

    return applyLicenseTransform(licenseTransform, license, currentYear)
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 */
const canApplyLicenseTransform = (licenseTransform, license) => {
    return licenseTransform.transform.test(license)
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 * @param {number} currentYear
 */
const applyLicenseTransform = (licenseTransform, license, currentYear) => {
    license = license.replace(licenseTransform.transform, (match, ...args) => {
        // The last argument is the groups object
        const groups = args[args.length - 1]

        if (groups === undefined) {
            throw new Error(`Transforming ${licenseTransform.name} license failed`)
        }

        const from = groups['from']

        if (Number(from) === currentYear) {
            return from
        }

        return `${from}-${currentYear}`
    })

    return license
}

module.exports = {
    applyTransform,
}
