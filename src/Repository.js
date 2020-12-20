const { readFileSync, writeFileSync } = require('fs');
const { getOctokit } = require('@actions/github');
const { exec } = require('./process');

const MASTER = 'master';

class Repository {
    /**
     * @param {string} owner The owner of the repository
     * @param {string} name The name of the repository
     * @param {string} token The GitHub access token
     */
    constructor(owner, name, token) {
        this.owner = owner;
        this.name = name;
        this.octokit = getOctokit(token);
    }

    /** @type {string} */
    _currentBranch = '';

    /** @type {boolean} */
    _isCurrentBranchNew = false;

    /** @type {string[]} */
    _writtenFiles = [];

    /**
     * @param {string} name The name of the branch
     */
    async branchExists(name) {
        try {
            const hasLocalBranch = async () => {
                const { stdout } = await exec(`git branch --list "${name}"`);
                return stdout.includes(name);
            };

            const hasRemoteBranch = async () => {
                const { stdout } = await exec(`git ls-remote --heads origin "${name}"`);
                return stdout.includes(name);
            };

            return (await hasLocalBranch()) || (await hasRemoteBranch());
        } catch (err) {
            err.message = `Error searching for branch "${name}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} name The name of the branch
     * @param {boolean} isNew Whether the branch is new and we also should create it
     */
    async checkoutBranch(name, isNew) {
        try {
            await exec(`git checkout ${isNew ? '-b' : ''} "${name}"`);

            this._currentBranch = name;
            this._isCurrentBranchNew = isNew;
        } catch (err) {
            err.message = `Error checking out branch "${name}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} path The path of the file
     */
    readFile(path) {
        try {
            const content = readFileSync(path, { encoding: 'utf8' });
            return content;
        } catch (err) {
            err.message = `Error reading file "${path}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} path The path of the file
     * @param {string} content The content to write
     */
    writeFile(path, content) {
        try {
            writeFileSync(path, content, { encoding: 'utf8' });
            this._writtenFiles.push(path);
        } catch (err) {
            err.message = `Error writing file "${path}": ${err.message}`;
            throw err;
        }
    }

    hasChanges() {
        return this._writtenFiles.length > 0;
    }

    async stageWrittenFiles() {
        for (const writtenFile in this._writtenFiles) {
            try {
                await exec(`git add "${writtenFile}"`);
            } catch (err) {
                err.message = `Error staging file "${writtenFile}": ${err.message}`;
                throw err;
            }
        }
    }

    /**
     * @param {string} message The commit message
     */
    async commit(message) {
        try {
            await exec(`git commit -m "${message}"`);
        } catch (err) {
            err.message = `Error committing staged files: ${err.message}`;
            throw err;
        }
    }

    async push() {
        try {
            let cmd = 'git push';
            if (this._isCurrentBranchNew) {
                cmd += ` --set-upstream origin ${this._currentBranch}`;
            }
            await exec(cmd);

            this._isCurrentBranchNew = false;
            this._writtenFiles = [];
        } catch (err) {
            err.message = `Error pushing changes to existing branch: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} sourceBranchName The name of the branch where your changes are implemented
     */
    async hasPullRequest(sourceBranchName) {
        try {
            const res = await this.octokit.pulls.list({
                owner: this.owner,
                repo: this.name,
                head: `${this.owner}:${sourceBranchName}`,
            });

            return res.data.length === 1;
        } catch (err) {
            err.message = `Error when checking whether pull request from ${sourceBranchName} to ${MASTER} exists: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} sourceBranchName The name of the branch where your changes are implemented
     * @param {string} title The title of the new pull request
     * @param {string} body The contents of the pull request
     */
    async createPullRequest(sourceBranchName, title, body) {
        try {
            return await this.octokit.pulls.create({
                owner: this.owner,
                repo: this.name,
                title,
                body,
                head: sourceBranchName,
                base: MASTER,
            });
        } catch (err) {
            err.message = `Error when creating pull request from ${sourceBranchName} to ${MASTER}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {number} issueNumber The issue number
     * @param {string[]} assignees Usernames of people to assign this issue to. NOTE: Only users
     *     with push access can add assignees to an issue. Assignees are silently ignored
     *     otherwise.
     */
    async addAssignees(issueNumber, assignees) {
        try {
            return await this.octokit.issues.addAssignees({
                owner: this.owner,
                repo: this.name,
                issue_number: issueNumber,
                assignees,
            });
        } catch (err) {
            err.message = `Error when adding assignees to issue ${issueNumber}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {number} issueNumber The issue number
     * @param {string[]} labels The name of the label to add to the issue. Must contain at least
     *     one label. Note: Alternatively, you can pass a single label as a string or an array of
     *     labels directly, but GitHub recommends passing an object with the labels key.
     */
    async addLabels(issueNumber, labels) {
        try {
            return await this.octokit.issues.addLabels({
                owner: this.owner,
                repo: this.name,
                issue_number: issueNumber,
                labels,
            });
        } catch (err) {
            err.message = `Error when adding labels to issue ${issueNumber}: ${err.message}`;
            throw err;
        }
    }
}

module.exports = {
    Repository,
};
