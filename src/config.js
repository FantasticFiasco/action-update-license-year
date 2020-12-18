const { getInput } = require('@actions/core');

const DEFAULT_PATH = 'LICENSE';
const DEFAULT_TRANSFORM = '';
const DEFAULT_BRANCH_NAME = 'license/copyright-to-{{currentYear}}';
const DEFAULT_COMMIT_TITLE = 'docs(license): update copyright year(s)';
const DEFAULT_COMMIT_BODY = '';
const DEFAULT_PR_TITLE = 'Update license copyright year(s)';
const DEFAULT_PR_BODY = '';
const DEFAULT_ASSIGNEES = '';
const DEFAULT_LABELS = '';

const CURRENT_YEAR = new Date().getFullYear();

const VARIABLES = {
    currentYear: CURRENT_YEAR.toString(),
};

function parseConfig() {
    const token = getInput('token', { required: true });
    const path = getInput('path') || DEFAULT_PATH;
    const transform = validateTransform(getInput('transform') || DEFAULT_TRANSFORM);
    const branchName = substituteVariables(getInput('branchName') || DEFAULT_BRANCH_NAME);
    const commitTitle = substituteVariables(getInput('commitTitle') || DEFAULT_COMMIT_TITLE);
    const commitBody = substituteVariables(getInput('commitBody') || DEFAULT_COMMIT_BODY);
    const pullRequestTitle = substituteVariables(getInput('prTitle') || DEFAULT_PR_TITLE);
    const pullRequestBody = substituteVariables(getInput('prBody') || DEFAULT_PR_BODY);
    const assignees = splitCsv(getInput('assignees') || DEFAULT_ASSIGNEES);
    const labels = splitCsv(getInput('labels') || DEFAULT_LABELS);

    return {
        token,
        path,
        transform,
        branchName,
        commitTitle,
        commitBody,
        pullRequestTitle,
        pullRequestBody,
        assignees,
        labels,
    };
}

/**
 * @param {string} text
 */
function substituteVariables(text) {
    // prettier-ignore
    const variableRegExp = new RegExp(
        '(?<!\\$)'    +  // '$'           negative lookbehind to ignore GitHub Action variables named '${{ variable }}'
        '{{\\s*'      +  // '{{ '
        '(\\w+)'      +  // 'variable'    variable name
        '\\s*}}',        // ' }}'
        'g'              // global
    );

    let match;
    while ((match = variableRegExp.exec(text)) !== null) {
        const name = match[1];
        if (!Object.prototype.hasOwnProperty.call(VARIABLES, name)) {
            throw new Error(`Configuration "${text}" contains unknown variable "${name}"`);
        }
        // @ts-ignore
        const value = VARIABLES[name];
        text = text.replace(variableRegExp, value);
    }

    return text;
}

/**
 * @param {string} values A comma-separated list of values
 */
function splitCsv(values) {
    return values
        .split(',')
        .map((value) => value.trim()) // Allow whitespaces in comma-separated list of values
        .filter((value) => value !== ''); // Remove empty entries
}

/**
 * @param {string} transform
 */
function validateTransform(transform) {
    if (transform !== DEFAULT_TRANSFORM && !transform.includes('?<from>')) {
        throw new Error('Transform has no capturing group named "from"');
    }

    return transform;
}

module.exports = {
    parseConfig,
    DEFAULT_PATH,
    DEFAULT_TRANSFORM,
    DEFAULT_BRANCH_NAME,
    DEFAULT_COMMIT_TITLE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
    DEFAULT_ASSIGNEES,
    DEFAULT_LABELS,
    CURRENT_YEAR,
};
