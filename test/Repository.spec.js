const mockOctokit = {
    git: {
        getRef: jest.fn(),
        createRef: jest.fn(),
    },
    repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
    },
    pulls: {
        list: jest.fn(),
        create: jest.fn(),
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

const Repository = require('../src/Repository');
const { ExitCode } = require('@actions/core');

beforeEach(() => {
    jest.resetAllMocks();
});

describe('#getBranch should', () => {
    test('return branch given branch exists', async () => {
        mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.getBranch('master');
        await expect(promise).resolves.toBe(GET_REF_SUCCESS_RESPONSE);
    });

    test("throw error given branch doesn't exist", async () => {
        mockOctokit.git.getRef.mockRejectedValue(GET_REF_FAILURE_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.getBranch('unknown-branch');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#hasBranch should', () => {
    test('return true given branch exists', async () => {
        mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.hasBranch('master');
        await expect(promise).resolves.toBe(true);
    });

    test("return false given branch doesn't exist", async () => {
        mockOctokit.git.getRef.mockRejectedValue(GET_REF_FAILURE_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.hasBranch('unknown-branch');
        await expect(promise).resolves.toBe(false);
    });

    test('throw error given bad status code', async () => {
        mockOctokit.git.getRef.mockRejectedValue({ status: '500' });
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.hasBranch('master');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#createBranch should', () => {
    test('successfully complete', async () => {
        mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
        mockOctokit.git.createRef.mockResolvedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.createBranch('some-branch');
        await expect(promise).resolves.toBeDefined();
    });

    test('throw error given some Octokit error', async () => {
        mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
        mockOctokit.git.createRef.mockRejectedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.createBranch('some-branch');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#getContent should', () => {
    test('return content given file exists', async () => {
        mockOctokit.repos.getContent.mockResolvedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.getContent('master', 'LICENSE');
        await expect(promise).resolves.toBeDefined();
    });

    test("throw error given file doesn't exist", async () => {
        mockOctokit.repos.getContent.mockRejectedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.getContent('master', 'unknown-file');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#updateContent should', () => {
    test('successfully complete given file exists', async () => {
        mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.updateContent('master', 'LICENSE', 'some sha', 'some content', 'some commit message');
        await expect(promise).resolves.toBeDefined();
    });

    test("throw error given file doesn't exist", async () => {
        mockOctokit.repos.createOrUpdateFileContents.mockRejectedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.updateContent('master', 'LICENSE', 'some sha', 'some content', 'some commit message');
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#hasPullRequest should', () => {
    test('return true given pull request exists', async () => {
        mockOctokit.pulls.list.mockResolvedValue({ data: ['some pull request'] });
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.hasPullRequest('some-branch');
        await expect(promise).resolves.toBe(true);
    });

    test("return false given pull request doesn't exist", async () => {
        mockOctokit.pulls.list.mockResolvedValue({ data: [] });
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.hasPullRequest('some-branch');
        await expect(promise).resolves.toBe(false);
    });
});

describe('#createPullRequest should', () => {
    test('successfully complete', async () => {
        mockOctokit.pulls.create.mockResolvedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.createPullRequest('some-branch', 'some title');
        await expect(promise).resolves.toBeDefined();
    });

    test('throw error given some Octokit error', async () => {
        mockOctokit.pulls.create.mockRejectedValue({});
        const repository = new Repository('some owner', 'some name', 'some token');
        const promise = repository.createPullRequest('some-branch', 'some title');
        await expect(promise).rejects.toBeDefined();
    });
});

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
