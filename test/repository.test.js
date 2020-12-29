const { mkdtempSync, rmdirSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { exec } = require('../src/process');

const mockOctokit = {
    pulls: {
        list: jest.fn(),
        create: jest.fn(),
    },
    issues: {
        addAssignees: jest.fn(),
        addLabels: jest.fn(),
    },
};

const mockGithub = {
    getOctokit: function () {
        return mockOctokit;
    },
};

jest.mock('@actions/github', () => {
    return mockGithub;
});

const { Repository } = require('../src/repository');

// The path to the root of this git repo
const thisRepoDir = join(__dirname, '..');

// The path to the root of a temporary local git repository that we can run our tests on
let tempRepoDir = '';

beforeEach(async () => {
    tempRepoDir = mkdtempSync(tmpdir());

    // Let's make the temp repo the working directory
    process.chdir(tempRepoDir);
    await exec('git init');
    await exec('echo "# Test repo" > README.md');
    await exec('git add README.md');
    await exec('git commit -m "docs(readme): add"');

    jest.resetAllMocks();
});

afterEach(() => {
    rmdirSync(tempRepoDir, {
        recursive: true,
    });

    process.chdir(thisRepoDir);
});

describe('#authenticate should', () => {
    test('configure git name and e-mail', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.authenticate();
        const { stdout: username } = await exec('git config user.name');
        expect(username).toBe('github-actions');
        const { stdout: email } = await exec('git config user.email');
        expect(email).toBe('github-actions@github.com');
    });
});

describe('#branchExists should', () => {
    beforeEach(() => {
        // These tests depend on the current repo
        process.chdir(thisRepoDir);
    });

    test('return true given local branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const got = await repo.branchExists('master');
        expect(got).toBe(true);
    });

    test('return true given remote branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const got = await repo.branchExists('test/branch-used-in-tests');
        expect(got).toBe(true);
    });

    test("return false given local and remote branch doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const got = await repo.branchExists('some-non-existing-branch');
        expect(got).toBe(false);
    });
});

describe('#checkoutBranch should', () => {
    test('successfully checkout existing branch', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.checkoutBranch('master', false);
    });

    test('successfully checkout new branch', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.checkoutBranch('new-branch', true);
    });
});

describe('#readFile should', () => {
    test('return content given file exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const got = await repo.readFile('README.md');
        expect(got).toBe('# Test repo\n');
    });

    test("throw error given file doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.readFile('unknown-file');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#writeFile should', () => {
    test('write content to file', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const content = '# New title\n';
        await repo.writeFile('README.md', content);
        await expect(repo.readFile('README.md')).resolves.toBe(content);
    });

    test('use utf8 encoding', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const content = 'Álvaro Mondéjar';
        await repo.writeFile('README.md', content);
        await expect(repo.readFile('README.md')).resolves.toBe(content);
    });

    test("throw error given file doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.writeFile('unknown-file', 'some content');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#hasChanges should', () => {
    test('return false given no changes', () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const got = repo.hasChanges();
        expect(got).toBe(false);
    });

    test('return true given changes', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        const got = repo.hasChanges();
        expect(got).toBe(true);
    });
});

describe('#stageWrittenFiles should', () => {
    test('complete given no written files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.stageWrittenFiles();
        const { stdout } = await exec('git diff --name-only --cached');
        expect(stdout).toBe('');
    });

    test('complete given written file', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        await repo.stageWrittenFiles();
        const { stdout } = await exec('git diff --name-only --cached');
        expect(stdout).toBe('README.md');
    });
});

describe('#commit should', () => {
    test('complete given staged files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        await repo.stageWrittenFiles();
        const message = 'some commit message';
        await repo.commit(message);
        const { stdout } = await exec('git log -n 1');
        expect(stdout).toContain(message);
    });

    test('throw error given no staged files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.commit('some commit message');
        expect(promise).rejects.toBeDefined();
    });
});

describe('#hasPullRequest should', () => {
    test('return true given pull request exists', async () => {
        mockOctokit.pulls.list.mockResolvedValue({
            data: ['some pull request'],
        });
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.hasPullRequest('some-branch');
        await expect(promise).resolves.toBe(true);
    });

    test("return false given pull request doesn't exist", async () => {
        mockOctokit.pulls.list.mockResolvedValue({
            data: [],
        });
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.hasPullRequest('some-branch');
        await expect(promise).resolves.toBe(false);
    });

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.pulls.list.mockRejectedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.hasPullRequest('some-branch');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#createPullRequest should', () => {
    test('successfully complete', async () => {
        mockOctokit.pulls.create.mockResolvedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.createPullRequest('some-branch', 'some title', 'some body');
        await expect(promise).resolves.toBeDefined();
    });

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.pulls.create.mockRejectedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.createPullRequest('some-branch', 'some title', 'some body');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#addAssignees should', () => {
    test('successfully complete', async () => {
        mockOctokit.issues.addAssignees.mockResolvedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
        await expect(promise).resolves.toBeDefined();
    });

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.issues.addAssignees.mockRejectedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#addLabels should', () => {
    test('successfully complete', async () => {
        mockOctokit.issues.addLabels.mockResolvedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.addLabels(42, ['some label 1', 'some label 2', 'some label 3']);
        await expect(promise).resolves.toBeDefined();
    });

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.issues.addLabels.mockRejectedValue({});
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.addLabels(42, ['some label 1', 'some label 2', 'some label 3']);
        await expect(promise).rejects.toBeDefined();
    });
});
