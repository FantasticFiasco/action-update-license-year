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

// describe('#getBranch should', () => {
//     test('return branch given branch exists', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getBranch('master');
//         await expect(promise).resolves.toBe(GET_REF_SUCCESS_RESPONSE);
//     });

//     test("throw error given branch doesn't exist", async () => {
//         mockOctokit.git.getRef.mockRejectedValue(GET_REF_FAILURE_RESPONSE);
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getBranch('unknown-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#createBranch should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         mockOctokit.git.createRef.mockResolvedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createBranch('some-branch');
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         mockOctokit.git.createRef.mockRejectedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createBranch('some-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#hasPullRequest should', () => {
//     test('return true given pull request exists', async () => {
//         mockOctokit.pulls.list.mockResolvedValue({
//             data: ['some pull request'],
//         });
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).resolves.toBe(true);
//     });

//     test("return false given pull request doesn't exist", async () => {
//         mockOctokit.pulls.list.mockResolvedValue({
//             data: [],
//         });
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).resolves.toBe(false);
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.pulls.list.mockRejectedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#createPullRequest should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.pulls.create.mockResolvedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createPullRequest('some-branch', 'some title', 'some body');
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.pulls.create.mockRejectedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createPullRequest('some-branch', 'some title', 'some body');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#addAssignees should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.issues.addAssignees.mockResolvedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.issues.addAssignees.mockRejectedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#addLabels should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.issues.addLabels.mockResolvedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addLabels(42, ['some label 1', 'some label 2', 'some label 3']);
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.issues.addLabels.mockRejectedValue({});
//         const repo = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addLabels(42, ['some label 1', 'some label 2', 'some label 3']);
//         await expect(promise).rejects.toBeDefined();
//     });
// });

const GET_REF_SUCCESS_RESPONSE = {
    status: 200,
    data: {
        object: {
            sha: 'some sha',
        },
    },
};

const GET_REF_FAILURE_RESPONSE = {
    status: 404,
};

/**
 * @param {string} value
 */
const fromBase64ToUtf8 = (value) => {
    return Buffer.from(value, 'base64').toString('utf8');
};
