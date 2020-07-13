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
     * @param {string} branchName The name of the branch
     * @param {string} path The file path
     */
    async getContent(branchName, path) {
        try {
            return await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.name,
                ref: `refs/heads/${branchName}`,
                path,
            });
        } catch (err) {
            err.message = `Error when getting content from file ${path} on branch ${branchName}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} branchName The name of the branch
     * @param {string} path The file path
     * @param {string} sha The SHA of the file being updated
     * @param {string} content The file content
     * @param {string} commitMessage The commit message
     */
    async updateContent(branchName, path, sha, content, commitMessage) {
        try {
            return await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.name,
                branch: branchName,
                path,
                message: commitMessage,
                content: Buffer.from(content, 'ascii').toString('base64'),
                sha,
            });
        } catch (err) {
            err.message = `Error when updating content of file ${path} on branch ${branchName}: ${err.message}`;
            throw err;
        }
    }

    /**
     * @param {string} sourceBranchName The name of the source branch
     */
    async hasPullRequest(sourceBranchName) {
        const res = await this.octokit.pulls.list({
            owner: this.owner,
            repo: this.name,
            head: `${this.owner}:${sourceBranchName}`,
        });

        return res.data.length === 1;
    }

    /**
     * @param {string} sourceBranchName The name of the source branch
     * @param {string} title The title of the pull request
     */
    async createPullRequest(sourceBranchName, title) {
        try {
            return await this.octokit.pulls.create({
                owner: this.owner,
                repo: this.name,
                title,
                head: sourceBranchName,
                base: MASTER,
            });
        } catch (err) {
            err.message = `Error when creating pull request from ${sourceBranchName} to ${MASTER}: ${err.message}`;
            throw err;
        }
    }
}

module.exports = Repository;
