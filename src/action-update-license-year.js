const { setFailed, info } = require('@actions/core');
const { context } = require('@actions/github');
const { parseConfig } = require('./config');
const { transformLicense } = require('./license');
const Repository = require('./Repository');

const FILENAME = 'LICENSE';
const MASTER = 'master';

async function run() {
    try {
        const { owner, repo } = context.repo;
        const {
            token,
            branchName,
            commitTitle,
            commitBody,
            pullRequestTitle,
            pullRequestBody,
            assignees,
            labels,
        } = parseConfig();

        const repository = new Repository(owner, repo, token);
        const hasBranch = await repository.hasBranch(branchName);
        if (hasBranch) {
            info(`Found branch named "${branchName}"`);
        }
        const licenseResponse = await repository.getContent(hasBranch ? branchName : MASTER, FILENAME);
        const license = Buffer.from(licenseResponse.data.content, 'base64').toString('utf8');

        const currentYear = new Date().getFullYear();
        info(`Current year is "${currentYear}"`);
        const updatedLicense = transformLicense(license, currentYear);
        if (updatedLicense === license) {
            info('License is already up-to-date, aborting');
            return;
        }

        if (!hasBranch) {
            info(`Create new branch named "${branchName}"`);
            await repository.createBranch(branchName);
        }

        const commitMessage = commitBody ? `${commitTitle}\n\n${commitBody}` : commitTitle;
        await repository.updateContent(branchName, FILENAME, licenseResponse.data.sha, updatedLicense, commitMessage);

        if (!(await repository.hasPullRequest(branchName))) {
            info(`Create new pull request with title "${pullRequestTitle}"`);
            const createPullRequestResponse = await repository.createPullRequest(
                branchName,
                pullRequestTitle,
                pullRequestBody
            );

            if (assignees.length > 0) {
                info(`Add assignees to pull request: ${JSON.stringify(assignees)}`);
                await repository.addAssignees(createPullRequestResponse.data.number, assignees);
            }

            if (labels.length > 0) {
                info(`Add labels to pull request: ${JSON.stringify(labels)}`);
                await repository.addLabels(createPullRequestResponse.data.number, labels);
            }
        }
    } catch (err) {
        setFailed(err.message);
    }
}

module.exports = {
    run,
    MASTER,
    FILENAME,
};
