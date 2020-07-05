import { getOctokit } from '@actions/github';

export class GitHub {
    /**
     * @param {string} owner The owner of the repository
     * @param {string} repo The name of the repository
     * @param {string} token The GitHub access token
     */
    constructor(owner, repo, token) {
        this.owner = owner;
        this.repo = repo;
        this.octokit = getOctokit(token);
    }

    /**
     * @param {string} name The name of the branch
     */
    async getBranch(name) {
        return await this.octokit.git.getRef({
            owner: this.owner,
            repo: this.repo,
            ref: `refs/heads/${name}`,
        });
    }

    /**
     * @param {string} name The name of the branch
     */
    async createBranch(name) {
        const master = await this.getBranch('master');

        await this.octokit.git.createRef({
            owner: this.owner,
            repo: this.repo,
            ref: `refs/heads/${name}`,
            sha: master.data.object.sha,
        });
    }

    /**
     * @param {string} branchName The name of the branch
     * @param {string} path The file path
     */
    async getContent(branchName, path) {
        return await this.octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            ref: `refs/heads/${branchName}`,
            path,
        });
    }

    /**
     * @param {string} branchName The name of the branch
     * @param {string} path The file path
     * @param {string} sha The SHA of the file being updated
     * @param {string} content The file content
     */
    async updateContent(branchName, path, sha, content) {
        await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            branch: branchName,
            path,
            message: 'docs(license): update copyright year(s)',
            content: Buffer.from(content, 'ascii').toString('base64'),
            sha,
        });
    }

    /**
     * @param {string} sourceBranchName The name of the source branch
     */
    async createPullRequest(sourceBranchName) {
        await this.octokit.pulls.create({
            owner: this.owner,
            repo: this.repo,
            title: 'Update license copyright year(s)',
            head: sourceBranchName,
            base: 'master',
        });
    }
}
