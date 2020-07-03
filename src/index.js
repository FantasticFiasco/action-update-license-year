import { getInput, setFailed } from '@actions/core';
import { getEnvironmentVariable, parseRepoPath } from './arguments';
import { GitHub } from './github';
import { License } from './license';

const main = async () => {
    try {
        // Inputs
        const token = getInput('token', { required: true });

        // Environment variables
        const repoPath = getEnvironmentVariable('GITHUB_REPOSITORY');

        const repo = parseRepoPath(repoPath);
        const github = new GitHub(token, repo.owner, repo.repo);
        const license = new License();

        await github.createBranch();
        const res = await github.readLicenseFile();
        const currentLicense = Buffer.from(res.data.content, 'base64').toString('ascii');
        const updatedLicense = license.update(currentLicense);
        await github.writeLicenseFile(res.data.sha, updatedLicense);
        await github.createPullRequest();
    } catch (err) {
        setFailed(err);
    }
};

main();
