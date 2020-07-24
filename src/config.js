const { getInput } = require('@actions/core');

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_BRANCH_NAME = 'license/copyright-to-{ currentYear }';
const DEFAULT_COMMIT_MESSAGE = 'docs(license): update copyright year(s)';
const DEFAULT_COMMIT_BODY = '';
const DEFAULT_PR_TITLE = 'Update license copyright year(s)';
const DEFAULT_PR_BODY = '';
const DEFAULT_ASSIGNEES = '';
const DEFAULT_LABELS = '';

function parseConfig() {
    const token = getInput('token', { required: true });
    const branchName = substituteVariable(
        getInput('branchName') || DEFAULT_BRANCH_NAME,
        'currentYear',
        CURRENT_YEAR.toString()
    );
    const commitMessage = getInput('commitMessage') || DEFAULT_COMMIT_MESSAGE;
    const commitBody = getInput('commitBody') || DEFAULT_COMMIT_BODY;
    const pullRequestTitle = getInput('prTitle') || DEFAULT_PR_TITLE;
    const pullRequestBody = getInput('prBody') || DEFAULT_PR_BODY;
    const assignees = splitCsv(getInput('assignees') || DEFAULT_ASSIGNEES);
    const labels = splitCsv(getInput('labels') || DEFAULT_LABELS);

    return {
        token,
        branchName,
        commitMessage,
        commitBody,
        pullRequestTitle,
        pullRequestBody,
        assignees,
        labels,
    };
}

/**
 * @param {string} text
 * @param {string} variableName
 * @param {string} variableValue
 */
function substituteVariable(text, variableName, variableValue) {
    const variableRegExp = /{\s*(\w+)\s*}/;
    const match = text.match(variableRegExp);
    if (!match) {
        return text;
    }
    if (match[1] !== variableName) {
        throw new Error(`Configuration "${text}" contains unknown variable "${match[1]}"`);
    }
    return text.replace(variableRegExp, variableValue);
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
    DEFAULT_COMMIT_MESSAGE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
    DEFAULT_ASSIGNEES,
    DEFAULT_LABELS,
};
