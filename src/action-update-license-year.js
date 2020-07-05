import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { GitHub } from './github';
import { License } from './license';

const FILENAME = 'LICENSE';
const BRANCH_NAME = `license/copyright-to-${new Date().getFullYear()}`;

export const run = async () => {
    try {
        // Context
        const { owner, repo } = context.repo;

        // Inputs
        const token = getInput('token', { required: true });

        const github = new GitHub(owner, repo, token);

        await github.createBranch(BRANCH_NAME);
        const res = await github.getContent('master', FILENAME);
        const currentLicense = Buffer.from(res.data.content, 'base64').toString('ascii');

        const license = new License();
        const updatedLicense = license.update(currentLicense);
        await github.updateContent(BRANCH_NAME, FILENAME, res.data.sha, updatedLicense);
        await github.createPullRequest(BRANCH_NAME);
    } catch (err) {
        setFailed(err.message);
    }
};
