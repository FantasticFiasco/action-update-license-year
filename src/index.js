const { setFailed, info } = require('@actions/core');
const { context } = require('@actions/github');

const file = require('./file');
const gpg = require('./gpg');
const inputs = require('./inputs');
const Repository = require('./repository');
const transforms = require('./transforms');

const run = async () => {
    try {
        const cwd = process.env.GITHUB_WORKSPACE;
        if (cwd === undefined) {
            throw new Error('GitHub Actions has not set the working directory');
        }
        info(`Working directory: ${cwd}`);

        const { owner, repo: repoName } = context.repo;
        const {
            token,
            path,
            transform,
            branchName,
            commitTitle,
            commitBody,
            commitAuthorName,
            commitAuthorEmail,
            gpgPrivateKey,
            pullRequestTitle,
            pullRequestBody,
            assignees,
            labels,
        } = inputs.parse();

        const repo = new Repository(owner, repoName, token);
        await repo.authenticate(commitAuthorName, commitAuthorEmail);

        if (gpgPrivateKey) {
            info('Setup GPG to sign commits');
            const keyId = await gpg.importPrivateKey(gpg.cli, inputs.GPG_PRIVATE_KEY.env);
            const gpgProgramFilePath = await gpg.createGpgProgram(inputs.GPG_PASSPHRASE.env);
            await repo.setupGpg(keyId, gpgProgramFilePath);
        }

        const branchExists = await repo.branchExists(branchName);
        info(`Checkout ${branchExists ? 'existing' : 'new'} branch named "${branchName}"`);
        await repo.checkoutBranch(branchName, !branchExists);

        const files = await file.search(path);
        if (files.length === 0) {
            throw new Error(`Found no files matching the path "${singleLine(path)}"`);
        }

        info(`Found ${files.length} file(s) matching the path "${singleLine(path)}"`);

        const currentYear = new Date().getFullYear();
        info(`Current year is "${currentYear}"`);

        for (const file of files) {
            const relativeFile = file.replace(cwd, '.');
            const content = await repo.readFile(file);
            const updatedContent = transforms.applyTransform(transform, content, currentYear, relativeFile);
            if (updatedContent !== content) {
                info(`Update license in "${relativeFile}"`);
                await repo.writeFile(file, updatedContent);
            } else {
                info(`File "${relativeFile}" is already up-to-date`);
            }
        }

        if (!repo.hasChanges()) {
            info(`No licenses were updated, let's abort`);
            return;
        }

        await repo.stageWrittenFiles();

        const commitMessage = commitBody ? `${commitTitle}\n\n${commitBody}` : commitTitle;
        await repo.commit(commitMessage);
        await repo.push();

        const hasPullRequest = await repo.hasPullRequest(branchName);
        if (!hasPullRequest) {
            info(`Create new pull request with title "${pullRequestTitle}"`);
            const createPullRequestResponse = await repo.createPullRequest(
                branchName,
                pullRequestTitle,
                pullRequestBody
            );

            if (assignees.length > 0) {
                info(`Add assignees to pull request: ${JSON.stringify(assignees)}`);
                await repo.addAssignees(createPullRequestResponse.data.number, assignees);
            }

            if (labels.length > 0) {
                info(`Add labels to pull request: ${JSON.stringify(labels)}`);
                await repo.addLabels(createPullRequestResponse.data.number, labels);
            }
        }
    } catch (err) {
        // @ts-ignore
        setFailed(err.message);
    }
};

/**
 * @param {string} text
 */
const singleLine = (text) => {
    return text.replace(/\n/g, '\\n');
};

(async () => {
    await run();
})();

module.exports = {
    run,
};
