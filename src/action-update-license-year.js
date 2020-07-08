import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';

const FILENAME = 'LICENSE';
const BRANCH_NAME = `license/copyright-to-${new Date().getFullYear()}`;

export const run = async () => {
    try {
        const { owner, repo } = context.repo;

        // Read GitHub access token
        const token = getInput('token', { required: true });

        // const repository = new Repository(owner, repo, token);

        // // Branch exists?
        // const hasBranch = await repository.hasBranch(BRANCH_NAME);

        // // Download license
        // const res = await repository.getContent(hasBranch ? BRANCH_NAME : 'master', FILENAME);
        // const license = Buffer.from(res.data.content, 'base64').toString('ascii');

        // // Update license
        // const updatedLicense = updateLicense(license);

        // // License updated?
        // if (updatedLicense !== license) {
        //     // Create branch if required
        //     if (!hasBranch) {
        //         await repository.createBranch(BRANCH_NAME);
        //     }

        //     // Upload license to branch
        //     await repository.updateContent(BRANCH_NAME, FILENAME, res.data.sha, updatedLicense);

        //     // Create PR if required
        //     if (!(await repository.hasPullRequest(BRANCH_NAME))) {
        //         await repository.createPullRequest(BRANCH_NAME);
        //     }
        // }
    } catch (err) {
        setFailed(err.message);
    }
};
