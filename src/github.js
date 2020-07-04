import { getOctokit } from '@actions/github';

export class GitHub {
    /**
     * @param {string} token
     * @param {string} owner
     * @param {string} repo
     */
    constructor(token, owner, repo) {
        this.octokit = getOctokit(token);
        this.owner = owner;
        this.repo = repo;
        this.branch = `license/copyright-to-${new Date().getFullYear()}`;
        this.branchRef = `refs/heads/${this.branch}`;
        this.path = 'LICENSE';
    }

    async createBranch() {
        const masterRef = await this.octokit.git.getRef({
            owner: this.owner,
            repo: this.repo,
            ref: 'heads/master',
        });

        await this.octokit.git.createRef({
            owner: this.owner,
            repo: this.repo,
            ref: this.branchRef,
            sha: masterRef.data.object.sha,
        });
    }

    async readLicenseFile() {
        return await this.octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            ref: this.branchRef,
            path: this.path,
        });
    }

    /**
     * @param {string} sha
     * @param {string} license
     */
    async writeLicenseFile(sha, license) {
        await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            branch: this.branch,
            path: this.path,
            message: 'docs(license): update copyright year(s)',
            content: Buffer.from(license, 'ascii').toString('base64'),
            sha,
        });
    }

    async createPullRequest() {
        await this.octokit.pulls.create({
            owner: this.owner,
            repo: this.repo,
            title: 'Update license copyright year(s)',
            head: this.branch,
            base: 'master',
        });
    }
}
