import { getInput, setFailed } from '@actions/core';
import { GitHub, parseRepoPath } from './github';
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

/**
 * @param {string} key
 */
const getEnvironmentVariable = (key) => {
    const value = process.env[key];
    if (typeof value === 'undefined') {
        throw new Error(`Environment variable required and not supplied: ${key}`);
    }
    return value;
};

main();
