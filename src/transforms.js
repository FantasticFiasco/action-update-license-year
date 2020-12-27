// Regular expressions capable of transforming the following license files:
// - GNU Affero General Public License v3.0 only (AGPL-3.0-only)
// prettier-ignore
const AGPL_3_ONLY_YEAR_RANGE = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (C) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '-\\d{4}'                                 +  // '-YYYY'
    '(?!\\s+free\\s+software\\s+foundation)',    // ' Free Software Foundation'  negative lookahead
    'im'                                         // Multi-line/Insensitive
);
// prettier-ignore
const AGPL_3_ONLY_SINGLE_YEAR = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (C) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '(?!\\s+free software foundation)',          // ' Free Software Foundation'  negative lookahead
    'im'                                         // Multi-line/Insensitive
);

// Regular expressions capable of transforming the following license files:
// - Apache 2.0 (Apache-2.0)
// - MIT (MIT)
// prettier-ignore
const APACHE_2_MIT_YEAR_RANGE = new RegExp(
    '(?<=copyright\\s+)'                      +  // 'Copyright '                 positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '-\\d{4}',                                   // '-YYYY'
    'im'                                         // Multi-line/Insensitive
);
// prettier-ignore
const APACHE_2_MIT_SINGLE_YEAR = new RegExp(
    '(?<=copyright\\s+)'                      +  // 'Copyright '                 positive lookbehind
    '(?<from>\\d{4})',                           // 'YYYY'                       group named 'from'
    'im'                                         // Multi-line/Insensitive
);

// Regular expressions capable of transforming the following license files:
// - BSD 2-clause "Simplified" (BSD-2-Clause)
// - BSD 3-clause "New" or "Revised" (BSD-3-Clause)
// prettier-ignore
const BSD_YEAR_RANGE = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (c) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '-\\d{4}'                                 +  // '-YYYY'
    '(?=,)',                                     // ','                          positive lookahead
    'im'                                         // Multi-line/Insensitive
)
// prettier-ignore
const BSD_SINGLE_YEAR = new RegExp(
    '(?<=copyright\\s+\\(c\\)\\s+)'           +  // 'Copyright (c) '             positive lookbehind
    '(?<from>\\d{4})'                         +  // 'YYYY'                       group named 'from'
    '(?=,)',                                     // ','                          positive lookahead
    'im'                                         // Multi-line/Insensitive
);

/**
 * @typedef LicenseTransform
 * @property {string} name
 * @property {RegExp} transform
 */
const DEFAULT_TRANSFORMS = [
    { name: 'AGPL-3.0-only', transform: AGPL_3_ONLY_YEAR_RANGE },
    { name: 'AGPL-3.0-only', transform: AGPL_3_ONLY_SINGLE_YEAR },
    { name: 'Apache-2.0', transform: APACHE_2_MIT_YEAR_RANGE },
    { name: 'Apache-2.0', transform: APACHE_2_MIT_SINGLE_YEAR },
    { name: 'BSD-2-Clause/BSD-3-Clause/MIT', transform: BSD_YEAR_RANGE },
    { name: 'BSD-2-Clause/BSD-3-Clause/MIT', transform: BSD_SINGLE_YEAR },
];

/**
 * @param {string} transform
 * @param {string} license
 * @param {number} currentYear
 */
function applyTransform(transform, license, currentYear) {
    return transform === ''
        ? applyDefaultTransform(license, currentYear)
        : applyCustomTransform(transform, license, currentYear);
}

/**
 * @param {string} transform
 * @param {string} license
 * @param {number} currentYear
 */
function applyCustomTransform(transform, license, currentYear) {
    const licenseTransform = {
        name: 'Custom',
        transform: new RegExp(transform, 'im'),
    };

    if (!canApplyLicenseTransform(licenseTransform, license)) {
        throw new Error('Specified license is not supported');
    }

    return applyLicenseTransform(licenseTransform, license, currentYear);
}

/**
 * @param {string} license
 * @param {number} currentYear
 */
function applyDefaultTransform(license, currentYear) {
    for (const licenseTransform of DEFAULT_TRANSFORMS) {
        if (canApplyLicenseTransform(licenseTransform, license)) {
            return applyLicenseTransform(licenseTransform, license, currentYear);
        }
    }

    throw new Error('Specified license is not supported');
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 */
function canApplyLicenseTransform(licenseTransform, license) {
    return licenseTransform.transform.test(license);
}

/**
 * @param {LicenseTransform} licenseTransform
 * @param {string} license
 * @param {number} currentYear
 */
function applyLicenseTransform(licenseTransform, license, currentYear) {
    const match = licenseTransform.transform.exec(license);
    if (match === null || match.groups === undefined) {
        throw new Error(`Transforming ${licenseTransform.name} license failed`);
    }

    if (Number(match.groups['from']) === currentYear) {
        return license;
    }

    return license.replace(licenseTransform.transform, `$<from>-${currentYear}`);
}

module.exports = {
    applyTransform,
};
