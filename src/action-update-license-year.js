const { getInput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { updateLicense } = require('./license');
const Repository = require('./Repository');

const FILENAME = 'LICENSE';
const BRANCH_NAME = `license/copyright-to-${new Date().getFullYear()}`;

// TODO: Write to output, e.g. when a license wasn't updated

async function run() {
    try {
        const { owner, repo } = context.repo;
        const token = getInput('token', { required: true });

        const repository = new Repository(owner, repo, token);
        const hasBranch = await repository.hasBranch(BRANCH_NAME);
        const licenseResponse = await repository.getContent(hasBranch ? BRANCH_NAME : 'master', FILENAME);
        const license = Buffer.from(licenseResponse.data.content, 'base64').toString('ascii');

        const updatedLicense = updateLicense(license);
        if (updatedLicense === license) {
            return;
        }

        if (!hasBranch) {
            await repository.createBranch(BRANCH_NAME);
        }

        await repository.updateContent(BRANCH_NAME, FILENAME, licenseResponse.data.sha, updatedLicense);

        if (!(await repository.hasPullRequest(BRANCH_NAME))) {
            await repository.createPullRequest(BRANCH_NAME);
        }
    } catch (err) {
        setFailed(err.message);
    }
}

module.exports = {
    run,
    FILENAME,
    BRANCH_NAME,
};
