import { getInput, setFailed } from '@actions/core';
import { context } from '@actions/github';
import { GitHub } from './github';
import { License } from './license';

export const run = async () => {
    try {
        // Context
        const { owner, repo } = context.repo;

        // Inputs
        const token = getInput('token', { required: true });

        const github = new GitHub(token, owner, repo);
        const license = new License();

        await github.createBranch();
        const res = await github.readLicenseFile();
        const currentLicense = Buffer.from(res.data.content, 'base64').toString('ascii');
        const updatedLicense = license.update(currentLicense);
        await github.writeLicenseFile(res.data.sha, updatedLicense);
        await github.createPullRequest();
    } catch (err) {
        setFailed(err.message);
    }
};
