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
        const licenseResponse = await repository.getContent(hasBranch ? branchName : MASTER, FILENAME);
        const license = Buffer.from(licenseResponse.data.content, 'base64').toString('ascii');

        const currentYear = new Date().getFullYear();
        const updatedLicense = transformLicense(license, currentYear);
        if (updatedLicense === license) {
            info('License file is already up-to-date, my work here is done');
            return;
        }

        if (!hasBranch) {
            info(`Create new branch named ${branchName}`);
            await repository.createBranch(branchName);
        }

        const commitMessage = commitBody ? `${commitTitle}\n\n${commitBody}` : commitTitle;
        await repository.updateContent(branchName, FILENAME, licenseResponse.data.sha, updatedLicense, commitMessage);

        if (!(await repository.hasPullRequest(branchName))) {
            info('Create new pull request');
            const createPullRequestResponse = await repository.createPullRequest(
                branchName,
                pullRequestTitle,
                pullRequestBody
            );

            if (assignees.length > 0) {
                info('Add assignees');
                await repository.addAssignees(createPullRequestResponse.data.id, assignees);
            }

            if (labels.length > 0) {
                info('Add labels');
                await repository.addLabels(createPullRequestResponse.data.id, labels);
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
