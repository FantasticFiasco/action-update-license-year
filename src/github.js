const github = require('@actions/github');

export class GitHub {
    constructor(token, owner, repo) {
        this.octokit = new github.GitHub(token);
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
        return await this.octokit.repos.getContents({
            owner: this.owner,
            repo: this.repo,
            ref: this.branchRef,
            path: this.path,
        });
    }

    async writeLicenseFile(sha, license) {
        await this.octokit.repos.createOrUpdateFile({
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
