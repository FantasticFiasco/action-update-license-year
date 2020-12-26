const { mkdtempSync, rmdirSync, readFileSync } = require('fs');
const { tmpdir } = require('os');
const { exec } = require('../src/process');

// TODO: Are all these mocked properties required?
const mockOctokit = {
    git: {
        getRef: jest.fn(),
        createRef: jest.fn(),
    },
    pulls: {
        list: jest.fn(),
        create: jest.fn(),
    },
    issues: {
        addAssignees: jest.fn(),
        addLabels: jest.fn(),
    },
    repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
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

const { Repository } = require('../src/Repository');

// A temporary local git repository that we can run our tests on
let repoDir = '';

beforeEach(async () => {
    repoDir = mkdtempSync(tmpdir());
    await exec('git init', { cwd: repoDir });
    await exec('echo "# Test repo" >> README.md', { cwd: repoDir });
    await exec('git add README.md', { cwd: repoDir });
    await exec('git commit -m "docs(readme): add"', { cwd: repoDir });

    jest.resetAllMocks();
});

afterEach(() => {
    rmdirSync(repoDir, {
        recursive: true,
    });
});

describe('#branchExists should', () => {
    test('return true given local branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const actual = await repo.branchExists('master');
        expect(actual).toBe(true);
    });

    test('return true given remote branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const actual = await repo.branchExists('test/branch-used-in-tests');
        expect(actual).toBe(true);
    });

    test("return false given local and remote branch doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token');
        const actual = await repo.branchExists('some-non-existing-branch');
        expect(actual).toBe(false);
    });
});

describe('#checkoutBranch should', () => {
    test('successfully checkout existing branch', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.checkoutBranch('master', false);
    });

    test('successfully checkout new branch', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.checkoutBranch('new-branch', true);
    });
});

describe('#readFile should', () => {
    test('return content given file exists', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const actual = await repo.readFile('README.md');
        expect(actual).toBe('# Test repo\n');
    });

    test("throw error given file doesn't exist", async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.readFile('unknown-file');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#writeFile should', () => {
    test('write content to file', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const content = '# New title\n';
        await repo.writeFile('README.md', content);
        await expect(repo.readFile('README.md')).resolves.toBe(content);
    });

    test('use utf8 encoding', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const content = 'Álvaro Mondéjar';
        await repo.writeFile('README.md', content);
        await expect(repo.readFile('README.md')).resolves.toBe(content);
    });

    test("throw error given file doesn't exist", async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const promise = repo.writeFile('unknown-file', 'some content');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#hasChanges should', () => {
    test('return false given no changes', () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        const actual = repo.hasChanges();
        expect(actual).toBe(false);
    });

    test('return true given changes', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        const actual = repo.hasChanges();
        expect(actual).toBe(true);
    });
});

describe('#stageWrittenFiles should', () => {
    test('complete given no written files', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.stageWrittenFiles();
        const { stdout } = await exec('git diff --name-only --cached', { cwd: repoDir });
        expect(stdout).toBe('');
    });

    test('complete given written file', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        await repo.stageWrittenFiles();
        const { stdout } = await exec('git diff --name-only --cached', { cwd: repoDir });
        expect(stdout).toBe('README.md\n');
    });
});

describe('#commit should', () => {
    test('complete given staged files', async () => {
        process.chdir(repoDir);
        const repo = new Repository('some owner', 'some name', 'some token');
        await repo.writeFile('README.md', '# New title\n');
        await repo.stageWrittenFiles();
        const message = 'some commit message';
        await repo.commit(message);
        const { stdout } = await exec('git log -n 1', { cwd: repoDir });
        expect(stdout).toContain(message);
    });

    test('throw error given no staged files', async () => {
        process.chdir(repoDir);
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
