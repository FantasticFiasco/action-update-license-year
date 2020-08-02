const { getInput } = require('@actions/core');

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
    const branchName = substituteVariables(getInput('branchName') || DEFAULT_BRANCH_NAME);
    const commitTitle = getInput('commitTitle') || DEFAULT_COMMIT_TITLE;
    const commitBody = getInput('commitBody') || DEFAULT_COMMIT_BODY;
    const pullRequestTitle = getInput('prTitle') || DEFAULT_PR_TITLE;
    const pullRequestBody = getInput('prBody') || DEFAULT_PR_BODY;
    const assignees = splitCsv(getInput('assignees') || DEFAULT_ASSIGNEES);
    const labels = splitCsv(getInput('labels') || DEFAULT_LABELS);

    return {
        token,
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
 * @param {string} value
 */
function substituteVariables(value) {
    const variableRegExp = /{{\s*(\w+)\s*}}/g;
    const matches = [...value.matchAll(variableRegExp)];
    for (const match of matches) {
        if (typeof VARIABLES[match[1]] === 'undefined') {
            throw new Error(`Configuration "${value}" contains unknown variable "${match[1]}"`);
        }
        value = value.replace(variableRegExp, VARIABLES[match[1]]);
    }
    return value;
    // const match = text.match(variableRegExp);
    // if (!match) {
    //     return text;
    // }
    // if (match[1] !== variableName) {
    //     throw new Error(`Configuration "${text}" contains unknown variable "${match[1]}"`);
    // }
    // return text.replace(variableRegExp, variableValue);
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

module.exports = {
    parseConfig,
    CURRENT_YEAR,
    DEFAULT_BRANCH_NAME,
    DEFAULT_COMMIT_TITLE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
    DEFAULT_ASSIGNEES,
    DEFAULT_LABELS,
};
