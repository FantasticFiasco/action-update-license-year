const { getOctokit } = require('@actions/github');
const { readFile, writeFile } = require('fs').promises;
const { createSignScript } = require('./gpg/cli/gpg2');
const { exec } = require('./os/process');
const { tempFile } = require('./os/temp-paths');

class Repository {
    /**
     * @param {string} owner The owner of the repository
     * @param {string} name The name of the repository
     * @param {string} token The GitHub access token
     */
    constructor(owner, name, token) {
        this._owner = owner;
        this._name = name;
        this._octokit = getOctokit(token);
        this._currentBranch = '';
        this._isCurrentBranchNew = false;
        /** @type {string[]} */
        this._writtenFiles = [];
    }

    /**
     * @param {string} userName
     * @param {string} email
     */
    async authenticate(userName, email) {
        try {
            await exec(`git config user.name ${userName}`);
            await exec(`git config user.email ${email}`);
        } catch (err) {
            // @ts-ignore
            err.message = `Error authenticating user "${userName}" with e-mail "${email}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} keyId
     * @param {string} passphrase
     */
    async setupGpg(keyId, passphrase) {
        try {
            const signScriptFilePath = tempFile('git_gpg_sign');
            await createSignScript(signScriptFilePath, passphrase);
            await exec(`git config gpg.program "${signScriptFilePath}"`);
            await exec(`git config commit.gpgsign true`);
            await exec(`git config --global user.signingkey ${keyId}`);
        } catch (err) {
            // @ts-ignore
            err.message = `Error setting up GPG": ${err.message}`;
            throw err;
        }
    }

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
            // @ts-ignore
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
            // @ts-ignore
            err.message = `Error checking out ${isNew ? 'new' : 'existing'} branch "${name}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} path The path of the file
     */
    async readFile(path) {
        try {
            const content = await readFile(path, { encoding: 'utf8' });
            return content;
        } catch (err) {
            // @ts-ignore
            err.message = `Error reading file "${path}": ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} path The path of the file
     * @param {string} content The content to write
     */
    async writeFile(path, content) {
        try {
            await writeFile(path, content, { encoding: 'utf8', flag: 'r+' });
            this._writtenFiles.push(path);
        } catch (err) {
            // @ts-ignore
            err.message = `Error writing file "${path}": ${err.message}`;
            throw err;
        }
    }

    hasChanges() {
        return this._writtenFiles.length > 0;
    }

    async stageWrittenFiles() {
        for (const writtenFile of this._writtenFiles) {
            try {
                await exec(`git add "${writtenFile}"`);
            } catch (err) {
                // @ts-ignore
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
            // @ts-ignore
            err.message = `Error committing files: ${err.message}`;
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
            // @ts-ignore
            err.message = `Error pushing changes to ${this._isCurrentBranchNew ? 'new' : 'existing'} branch: ${
                // @ts-ignore
                err.message
            }`;
            throw err;
        }
    }

    /**
     * @param {string} sourceBranchName The name of the branch where your changes are implemented
     */
    async hasPullRequest(sourceBranchName) {
        try {
            const res = await this._octokit.rest.pulls.list({
                owner: this._owner,
                repo: this._name,
                head: `${this._owner}:${sourceBranchName}`,
            });

            return res.data.length === 1;
        } catch (err) {
            // @ts-ignore
            err.message = `Error when checking whether pull request from ${sourceBranchName} exists: ${err.message}`;
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
            const { stdout: defaultBranch } = await exec(
                `git remote show origin | grep 'HEAD branch' | cut -d ' ' -f5`
            );

            return await this._octokit.rest.pulls.create({
                owner: this._owner,
                repo: this._name,
                title,
                body,
                head: sourceBranchName,
                base: defaultBranch,
            });
        } catch (err) {
            // @ts-ignore
            err.message = `Error when creating pull request from ${sourceBranchName}: ${err.message}`;
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
            return await this._octokit.rest.issues.addAssignees({
                owner: this._owner,
                repo: this._name,
                issue_number: issueNumber,
                assignees,
            });
        } catch (err) {
            // @ts-ignore
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
            return await this._octokit.rest.issues.addLabels({
                owner: this._owner,
                repo: this._name,
                issue_number: issueNumber,
                labels,
            });
        } catch (err) {
            // @ts-ignore
            err.message = `Error when adding labels to issue ${issueNumber}: ${err.message}`;
            throw err;
        }
    }
}

module.exports = Repository;
