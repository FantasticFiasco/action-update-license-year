import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { Repository } from './Repository';

const FILENAME = 'LICENSE';
const BRANCH_NAME = `license/copyright-to-${new Date().getFullYear()}`;

export const run = async () => {
    try {
        // Context
        const { owner, repo } = context.repo;

        // Inputs
        const token = getInput('token', { required: true });

        const repository = new Repository(owner, repo, token);

        const branch = await repository.getBranch(BRANCH_NAME);

        // await github.createBranch(BRANCH_NAME);
        // const res = await github.getContent('master', FILENAME);
        // const currentLicense = Buffer.from(res.data.content, 'base64').toString('ascii');

        // const license = new License();
        // const updatedLicense = license.update(currentLicense);
        // await github.updateContent(BRANCH_NAME, FILENAME, res.data.sha, updatedLicense);
        // await github.createPullRequest(BRANCH_NAME);
    } catch (err) {
        setFailed(err.message);
    }
};
