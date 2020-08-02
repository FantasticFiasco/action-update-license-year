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
    const commitTitle = substituteVariables(getInput('commitTitle') || DEFAULT_COMMIT_TITLE);
    const commitBody = substituteVariables(getInput('commitBody') || DEFAULT_COMMIT_BODY);
    const pullRequestTitle = substituteVariables(getInput('prTitle') || DEFAULT_PR_TITLE);
    const pullRequestBody = substituteVariables(getInput('prBody') || DEFAULT_PR_BODY);
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
 * @param {string} text
 */
function substituteVariables(text) {
    const variableRegExp = /{{\s*(\w+)\s*}}/g;
    let match;
    while ((match = variableRegExp.exec(text)) !== null) {
        const variableName = match[1];
        if (!VARIABLES.hasOwnProperty(variableName)) {
            throw new Error(`Configuration "${text}" contains unknown variable "${variableName}"`);
        }
        // @ts-ignore
        text = text.replace(variableRegExp, VARIABLES[variableName]);
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
