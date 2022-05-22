const { getInput } = require('@actions/core')

const TOKEN = {
    name: 'token',
    env: 'INPUT_TOKEN',
}

const PATH = {
    name: 'path',
    env: 'INPUT_PATH',
    defaultValue: 'LICENSE',
}

const TRANSFORM = {
    name: 'transform',
    env: 'INPUT_TRANSFORM',
    defaultValue: '',
}

const BRANCH_NAME = {
    name: 'branchName',
    env: 'INPUT_BRANCHNAME',
    defaultValue: 'license/copyright-to-{{currentYear}}',
}

const COMMIT_TITLE = {
    name: 'commitTitle',
    env: 'INPUT_COMMITTITLE',
    defaultValue: 'docs(license): update copyright year(s)',
}

const COMMIT_BODY = {
    name: 'commitBody',
    env: 'INPUT_COMMITBODY',
    defaultValue: '',
}

const COMMIT_AUTHOR_NAME = {
    name: 'commitAuthorName',
    env: 'INPUT_COMMITAUTHORNAME',
    defaultValue: 'github-actions',
}

const COMMIT_AUTHOR_EMAIL = {
    name: 'commitAuthorEmail',
    env: 'INPUT_COMMITAUTHOREMAIL',
    defaultValue: 'github-actions@github.com',
}

const GPG_PRIVATE_KEY = {
    name: 'gpgPrivateKey',
    env: 'INPUT_GPGPRIVATEKEY',
    defaultValue: '',
}

const GPG_PASSPHRASE = {
    name: 'gpgPassphrase',
    env: 'INPUT_GPGPASSPHRASE',
    defaultValue: '',
}

const PR_TITLE = {
    name: 'prTitle',
    env: 'INPUT_PRTITLE',
    defaultValue: 'Update license copyright year(s)',
}

const PR_BODY = {
    name: 'prBody',
    env: 'INPUT_PRBODY',
    defaultValue: '',
}

const ASSIGNEES = {
    name: 'assignees',
    env: 'INPUT_ASSIGNEES',
    defaultValue: '',
}

const LABELS = {
    name: 'labels',
    env: 'INPUT_LABELS',
    defaultValue: '',
}

const CURRENT_YEAR = new Date().getFullYear()

const VARIABLES = {
    currentYear: CURRENT_YEAR.toString(),
}

const parse = () => {
    const token = getInput(TOKEN.name, { required: true })
    const path = getInput(PATH.name) || PATH.defaultValue
    const transform = validateTransform(getInput(TRANSFORM.name) || TRANSFORM.defaultValue)
    const branchName = substituteVariables(getInput(BRANCH_NAME.name) || BRANCH_NAME.defaultValue)
    const commitTitle = substituteVariables(getInput(COMMIT_TITLE.name) || COMMIT_TITLE.defaultValue)
    const commitBody = substituteVariables(getInput(COMMIT_BODY.name) || COMMIT_BODY.defaultValue)
    const commitAuthorName = getInput(COMMIT_AUTHOR_NAME.name) || COMMIT_AUTHOR_NAME.defaultValue
    const commitAuthorEmail = getInput(COMMIT_AUTHOR_EMAIL.name) || COMMIT_AUTHOR_EMAIL.defaultValue
    const gpgPrivateKey = getInput(GPG_PRIVATE_KEY.name) || GPG_PRIVATE_KEY.defaultValue
    const gpgPassphrase = getInput(GPG_PASSPHRASE.name) || GPG_PASSPHRASE.defaultValue
    const pullRequestTitle = substituteVariables(getInput(PR_TITLE.name) || PR_TITLE.defaultValue)
    const pullRequestBody = substituteVariables(getInput(PR_BODY.name) || PR_BODY.defaultValue)
    const assignees = splitCsv(getInput(ASSIGNEES.name) || ASSIGNEES.defaultValue)
    const labels = splitCsv(getInput(LABELS.name) || LABELS.defaultValue)

    return {
        token,
        path,
        transform,
        branchName,
        commitTitle,
        commitBody,
        commitAuthorName,
        commitAuthorEmail,
        gpgPrivateKey,
        gpgPassphrase,
        pullRequestTitle,
        pullRequestBody,
        assignees,
        labels,
    }
}

/**
 * @param {string} text
 */
const substituteVariables = (text) => {
    // prettier-ignore
    const variableRegExp = new RegExp(
        '(?<!\\$)'    +  // '$'           negative lookbehind to ignore GitHub Action variables named '${{ variable }}'
        '{{\\s*'      +  // '{{ '
        '(\\w+)'      +  // 'variable'    variable name
        '\\s*}}',        // ' }}'
        'g'              // global
    );

    let match
    while ((match = variableRegExp.exec(text)) !== null) {
        const name = match[1]
        if (!Object.prototype.hasOwnProperty.call(VARIABLES, name)) {
            throw new Error(`Configuration "${text}" contains unknown variable "${name}"`)
        }
        // @ts-ignore
        const value = VARIABLES[name]
        text = text.replace(variableRegExp, value)
    }

    return text
}

/**
 * @param {string} values A comma-separated list of values
 */
const splitCsv = (values) => {
    return values
        .split(',')
        .map((value) => value.trim()) // Allow whitespaces in comma-separated list of values
        .filter((value) => value !== '') // Remove empty entries
}

/**
 * @param {string} transform
 */
const validateTransform = (transform) => {
    if (transform !== TRANSFORM.defaultValue && !transform.includes('?<from>')) {
        throw new Error('Transform has no capturing group named "from"')
    }

    return transform
}

module.exports = {
    parse,
    TOKEN,
    PATH,
    TRANSFORM,
    BRANCH_NAME,
    COMMIT_TITLE,
    COMMIT_BODY,
    COMMIT_AUTHOR_NAME,
    COMMIT_AUTHOR_EMAIL,
    GPG_PRIVATE_KEY,
    GPG_PASSPHRASE,
    PR_TITLE,
    PR_BODY,
    ASSIGNEES,
    LABELS,
    CURRENT_YEAR,
}
