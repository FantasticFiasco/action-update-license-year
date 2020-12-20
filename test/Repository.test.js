const { mkdtempSync, rmdirSync } = require('fs');
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

    jest.resetAllMocks();
});

afterEach(() => {
    rmdirSync(repoDir, {
        recursive: true,
    });
});

describe('#branchExists', () => {
    test('should return true given local branch exists', async () => {
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.branchExists('master');
        await expect(promise).resolves.toBe(true);
    });

    test('should return true given remote branch exists', async () => {
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.branchExists('test/branch-used-in-tests');
        await expect(promise).resolves.toBe(true);
    });

    test("should return false given local and remote branch doesn't exist", async () => {
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.branchExists('some-non-existing-branch');
        await expect(promise).resolves.toBe(false);
    });
});

// describe('#getBranch should', () => {
//     test('return branch given branch exists', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getBranch('master');
//         await expect(promise).resolves.toBe(GET_REF_SUCCESS_RESPONSE);
//     });

//     test("throw error given branch doesn't exist", async () => {
//         mockOctokit.git.getRef.mockRejectedValue(GET_REF_FAILURE_RESPONSE);
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getBranch('unknown-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#createBranch should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         mockOctokit.git.createRef.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createBranch('some-branch');
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
//         mockOctokit.git.createRef.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createBranch('some-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#getContent should', () => {
//     test('return content given file exists', async () => {
//         const content = {
//             data: {
//                 content: 'some content',
//             },
//         };
//         mockOctokit.repos.getContent.mockResolvedValue(content);
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getContent('master', 'LICENSE');
//         await expect(promise).resolves.toBe(content);
//     });

//     test("throw error given file doesn't exist", async () => {
//         mockOctokit.repos.getContent.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.getContent('master', 'unknown-file');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#updateContent should', () => {
//     test('successfully complete given file exists', async () => {
//         mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.updateContent(
//             'master',
//             'LICENSE',
//             'some sha',
//             'some content',
//             'some commit message'
//         );
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('use utf8 encoding', async () => {
//         mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const content = 'Álvaro Mondéjar';
//         const promise = repository.updateContent('master', 'LICENSE', 'some sha', content, 'some commit message');
//         await expect(promise).resolves.toBeDefined();
//         expect(fromBase64ToUtf8(mockOctokit.repos.createOrUpdateFileContents.mock.calls[0][0].content)).toBe(content);
//     });

//     test("throw error given file doesn't exist", async () => {
//         mockOctokit.repos.createOrUpdateFileContents.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.updateContent(
//             'master',
//             'unknown-file',
//             'some sha',
//             'some content',
//             'some commit message'
//         );
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#hasPullRequest should', () => {
//     test('return true given pull request exists', async () => {
//         mockOctokit.pulls.list.mockResolvedValue({
//             data: ['some pull request'],
//         });
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).resolves.toBe(true);
//     });

//     test("return false given pull request doesn't exist", async () => {
//         mockOctokit.pulls.list.mockResolvedValue({
//             data: [],
//         });
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).resolves.toBe(false);
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.pulls.list.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.hasPullRequest('some-branch');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#createPullRequest should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.pulls.create.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createPullRequest('some-branch', 'some title', 'some body');
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.pulls.create.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.createPullRequest('some-branch', 'some title', 'some body');
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#addAssignees should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.issues.addAssignees.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.issues.addAssignees.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addAssignees(42, ['assignee1', 'assignee2', 'assignee3']);
//         await expect(promise).rejects.toBeDefined();
//     });
// });

// describe('#addLabels should', () => {
//     test('successfully complete', async () => {
//         mockOctokit.issues.addLabels.mockResolvedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
//         const promise = repository.addLabels(42, ['some label 1', 'some label 2', 'some label 3']);
//         await expect(promise).resolves.toBeDefined();
//     });

//     test('throw error given unexpected Octokit error', async () => {
//         mockOctokit.issues.addLabels.mockRejectedValue({});
//         const repository = new Repository('some owner', 'some name', 'some token');
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
