const { getOctokit } = require('@actions/github');

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

    /**
     * @param {string} name The name of the branch
     */
    async getBranch(name) {
        try {
            return await this.octokit.git.getRef({
                owner: this.owner,
                repo: this.name,
                ref: `heads/${name}`,
            });
        } catch (err) {
            err.message = `Error when getting branch ${name}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} name The name of the branch
     */
    async hasBranch(name) {
        try {
            const res = await this.getBranch(name);
            return res.status === 200;
        } catch (err) {
            if (err.status && err.status === 404) {
                return false;
            }
            err.message = `Error when checking whether branch ${name} exists: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} name The name of the branch
     */
    async createBranch(name) {
        try {
            const master = await this.getBranch(MASTER);

            return await this.octokit.git.createRef({
                owner: this.owner,
                repo: this.name,
                ref: `refs/heads/${name}`,
                sha: master.data.object.sha,
            });
        } catch (err) {
            err.message = `Error creating branch ${name}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} branchName The branch name
     * @param {string} filePath The file path
     */
    async getContent(branchName, filePath) {
        try {
            return await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.name,
                ref: `refs/heads/${branchName}`,
                path: filePath,
            });
        } catch (err) {
            err.message = `Error when getting content from file ${filePath} on branch ${branchName}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} branchName The branch name
     * @param {string} filePath The file path
     * @param {string} sha The blob SHA of the file being replaced
     * @param {string} content The new file content, using UTF8 encoding
     * @param {string} commitMessage The commit message
     */
    async updateContent(branchName, filePath, sha, content, commitMessage) {
        try {
            return await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.name,
                branch: branchName,
                path: filePath,
                message: commitMessage,
                content: Buffer.from(content, 'utf8').toString('base64'),
                sha,
            });
        } catch (err) {
            err.message = `Error when updating content of file ${filePath} on branch ${branchName}: ${err.message}`;
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

module.exports = Repository;
