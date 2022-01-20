// @actions/core
const mockCore = {
    info: jest.fn(),
    setFailed: jest.fn(),
};
jest.mock('@actions/core', () => {
    return mockCore;
});

// @actions/github
const mockGithub = {
    context: {
        repo: {
            owner: 'FantasticFiasco',
            repo: 'action-update-license-year',
        },
    },
};
jest.mock('@actions/github', () => {
    return mockGithub;
});

// ../src/file
const mockFile = {
    search: jest.fn(),
};
jest.mock('../src/file', () => {
    return mockFile;
});

// ../src/gpg
const mockGpg = {
    importPrivateKey: jest.fn(),
    cli: jest.fn(),
    createGpgProgram: jest.fn(),
};
jest.mock('../src/gpg', () => {
    return mockGpg;
});

// ../src/inputs
const mockInputs = {
    parse: jest.fn(),
    TOKEN: jest.requireActual('../src/inputs').TOKEN,
    PATH: jest.requireActual('../src/inputs').PATH,
    TRANSFORM: jest.requireActual('../src/inputs').TRANSFORM,
    BRANCH_NAME: jest.requireActual('../src/inputs').BRANCH_NAME,
    COMMIT_TITLE: jest.requireActual('../src/inputs').COMMIT_TITLE,
    COMMIT_BODY: jest.requireActual('../src/inputs').COMMIT_BODY,
    COMMIT_AUTHOR_NAME: jest.requireActual('../src/inputs').COMMIT_AUTHOR_NAME,
    COMMIT_AUTHOR_EMAIL: jest.requireActual('../src/inputs').COMMIT_AUTHOR_EMAIL,
    GPG_PRIVATE_KEY: jest.requireActual('../src/inputs').GPG_PRIVATE_KEY,
    GPG_PASSPHRASE: jest.requireActual('../src/inputs').GPG_PASSPHRASE,
    PR_TITLE: jest.requireActual('../src/inputs').PR_TITLE,
    PR_BODY: jest.requireActual('../src/inputs').PR_BODY,
    ASSIGNEES: jest.requireActual('../src/inputs').ASSIGNEES,
    LABELS: jest.requireActual('../src/inputs').LABELS,
    CURRENT_YEAR: jest.requireActual('../src/inputs').CURRENT_YEAR,
};
jest.mock('../src/inputs', () => {
    return mockInputs;
});

// ../src/repository
const mockRepository = {
    authenticate: jest.fn(),
    setupGpg: jest.fn(),
    branchExists: jest.fn(),
    checkoutBranch: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    hasChanges: jest.fn(),
    stageWrittenFiles: jest.fn(),
    commit: jest.fn(),
    push: jest.fn(),
    hasPullRequest: jest.fn(),
    createPullRequest: jest.fn(),
    addAssignees: jest.fn(),
    addLabels: jest.fn(),
};
jest.mock('../src/repository', () => {
    return function () {
        return mockRepository;
    };
});

// ../src/transforms
const mockTransforms = {
    applyTransform: jest.fn(),
};
jest.mock('../src/transforms', () => {
    return mockTransforms;
});

const { setFailed } = require('@actions/core');
const { run } = require('../src/main');
const {
    PATH,
    TRANSFORM,
    BRANCH_NAME,
    COMMIT_TITLE,
    COMMIT_BODY,
    COMMIT_AUTHOR_NAME,
    COMMIT_AUTHOR_EMAIL,
    GPG_PRIVATE_KEY,
    GPG_PASSPHRASE,
    PR_TITLE,
    PR_BODY,
    CURRENT_YEAR,
} = require('../src/inputs');

describe('action should', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        process.env.GITHUB_WORKSPACE = '/some/workspace';
        setupInput({});
    });

    afterEach(() => {
        delete process.env.GITHUB_WORKSPACE;
    });

    test('set failed given no working directory', async () => {
        delete process.env.GITHUB_WORKSPACE;
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('authenticate git user given default commit author name and e-mail', async () => {
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.authenticate).toBeCalledWith(
            COMMIT_AUTHOR_NAME.defaultValue,
            COMMIT_AUTHOR_EMAIL.defaultValue
        );
        expect(setFailed).toBeCalledTimes(0);
    });

    test('authenticate git user given custom commit author name', async () => {
        setupInput({ commitAuthorName: 'some-author-name' });
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.authenticate).toBeCalledWith('some-author-name', COMMIT_AUTHOR_EMAIL.defaultValue);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('authenticate git user given custom commit author e-mail', async () => {
        setupInput({ commitAuthorEmail: 'some-author@mail.com' });
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.authenticate).toBeCalledWith(COMMIT_AUTHOR_NAME.defaultValue, 'some-author@mail.com');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('authenticate git user given custom commit author name and e-mail', async () => {
        setupInput({ commitAuthorName: 'some-author-name', commitAuthorEmail: 'some-author@mail.com' });
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.authenticate).toBeCalledWith('some-author-name', 'some-author@mail.com');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('setup gpg given gpg private key with passphrase', async () => {
        setupInput({ gpgPrivateKey: 'some private key', gpgPassphrase: 'some passphrase' });
        mockGpg.importPrivateKey.mockResolvedValue('some key');
        mockGpg.createGpgProgram.mockResolvedValue('some file path');
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockGpg.importPrivateKey).toBeCalledWith(mockGpg.cli, GPG_PRIVATE_KEY.env);
        expect(mockGpg.createGpgProgram).toBeCalledWith(GPG_PASSPHRASE.env);
        expect(mockRepository.setupGpg).toBeCalledWith('some key', 'some file path');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('setup gpg given gpg private key without passphrase', async () => {
        setupInput({ gpgPrivateKey: 'some private key' });
        mockGpg.importPrivateKey.mockResolvedValue('some key');
        mockGpg.createGpgProgram.mockResolvedValue('some file path');
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockGpg.importPrivateKey).toBeCalledWith(mockGpg.cli, GPG_PRIVATE_KEY.env);
        expect(mockGpg.createGpgProgram).toBeCalledWith(GPG_PASSPHRASE.env);
        expect(mockRepository.setupGpg).toBeCalledWith('some key', 'some file path');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('checkout existing branch with default name given it exists', async () => {
        mockRepository.branchExists.mockResolvedValue(true);
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith(BRANCH_NAME.defaultValue, false);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('checkout existing branch with custom name given it exists', async () => {
        setupInput({ branchName: 'some-branch-name' });
        mockRepository.branchExists.mockResolvedValue(true);
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith('some-branch-name', false);
        expect(setFailed).toBeCalledTimes(0);
    });

    test("create new branch with default name given it doesn't exist", async () => {
        mockRepository.branchExists.mockResolvedValue(false);
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith(BRANCH_NAME.defaultValue, true);
        expect(setFailed).toBeCalledTimes(0);
    });

    test("create new branch with custom name given it doesn't exist", async () => {
        setupInput({ branchName: 'some-branch-name' });
        mockRepository.branchExists.mockResolvedValue(false);
        mockFile.search.mockResolvedValue(['some-file']);
        await run();
        expect(mockRepository.checkoutBranch).toBeCalledWith('some-branch-name', true);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('set failed given no files matching the path', async () => {
        mockFile.search.mockResolvedValue([]);
        await run();
        expect(setFailed).toBeCalledTimes(1);
    });

    test('applies default transform on all files matching the path', async () => {
        mockFile.search.mockResolvedValue(['some-file-1', 'some-file-2']);
        await run();
        expect(mockTransforms.applyTransform).nthCalledWith(
            1,
            TRANSFORM.defaultValue,
            undefined,
            CURRENT_YEAR,
            'some-file-1'
        );
        expect(mockTransforms.applyTransform).nthCalledWith(
            2,
            TRANSFORM.defaultValue,
            undefined,
            CURRENT_YEAR,
            'some-file-2'
        );
        expect(setFailed).toBeCalledTimes(0);
    });

    test('applies custom transform on all files matching the path', async () => {
        setupInput({ transform: 'custom transform' });
        mockFile.search.mockResolvedValue(['some-file-1', 'some-file-2']);
        await run();
        expect(mockTransforms.applyTransform).nthCalledWith(
            1,
            'custom transform',
            undefined,
            CURRENT_YEAR,
            'some-file-1'
        );
        expect(mockTransforms.applyTransform).nthCalledWith(
            2,
            'custom transform',
            undefined,
            CURRENT_YEAR,
            'some-file-2'
        );
        expect(setFailed).toBeCalledTimes(0);
    });

    test('writes file given transform updates it', async () => {
        mockFile.search.mockResolvedValue(['some-file']);
        mockTransforms.applyTransform.mockReturnValue('updated content');
        await run();
        expect(mockRepository.writeFile).toBeCalledWith('some-file', 'updated content');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('aborts if no files where changed', async () => {
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(false);
        await run();
        expect(mockRepository.stageWrittenFiles).toBeCalledTimes(0);
        expect(mockRepository.commit).toBeCalledTimes(0);
        expect(mockRepository.push).toBeCalledTimes(0);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('stages, commits and pushes if files where changed', async () => {
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.stageWrittenFiles).toBeCalledTimes(1);
        expect(mockRepository.commit).toBeCalledTimes(1);
        expect(mockRepository.push).toBeCalledTimes(1);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with default commit title and body', async () => {
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith(COMMIT_TITLE.defaultValue);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with custom commit title and default body', async () => {
        setupInput({ commitTitle: 'some commit title' });
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith('some commit title');
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with default commit title and custom body', async () => {
        setupInput({ commitBody: 'some commit body' });
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith(`${COMMIT_TITLE.defaultValue}\n\nsome commit body`);
        expect(setFailed).toBeCalledTimes(0);
    });

    test('commits with custom commit title and custom body', async () => {
        setupInput({ commitTitle: 'some commit title', commitBody: 'some commit body' });
        mockFile.search.mockResolvedValue(['some-file']);
        mockRepository.hasChanges.mockReturnValue(true);
        await run();
        expect(mockRepository.commit).toBeCalledWith('some commit title\n\nsome commit body');
        expect(setFailed).toBeCalledTimes(0);
    });

    describe("given pull request doesn't exist", () => {
        test('skip creating pull request given files are unchanged', async () => {
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(false);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with default title and body', async () => {
            setupInput({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: PR_BODY.defaultValue });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                PR_BODY.defaultValue
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with default title and custom body', async () => {
            setupInput({ pullRequestTitle: PR_TITLE.defaultValue, pullRequestBody: 'some pr body' });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                PR_TITLE.defaultValue,
                'some pr body'
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with custom title and default body', async () => {
            setupInput({ pullRequestTitle: 'some pr title', pullRequestBody: PR_BODY.defaultValue });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                'some pr title',
                PR_BODY.defaultValue
            );
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request with custom title and body', async () => {
            setupInput({ pullRequestTitle: 'some pr title', pullRequestBody: 'some pr body' });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(setFailed).toBeCalledTimes(0);
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(mockRepository.createPullRequest).toBeCalledWith(
                BRANCH_NAME.defaultValue,
                'some pr title',
                'some pr body'
            );
        });

        test('create pull request and add assignees given configuration', async () => {
            setupInput({ assignees: ['assignee1', 'assignee2', 'assignee3'] });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
            await run();
            expect(mockRepository.addAssignees).toBeCalledWith(42, ['assignee1', 'assignee2', 'assignee3']);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and skip adding assignees given no configuration', async () => {
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.addAssignees).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and add labels given configuration', async () => {
            setupInput({ labels: ['some label 1', 'some label 2', 'some label 3'] });
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockResolvedValue({ data: { number: 42 } });
            await run();
            expect(mockRepository.addLabels).toBeCalledWith(42, ['some label 1', 'some label 2', 'some label 3']);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('create pull request and skip adding labels given no configuration', async () => {
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            await run();
            expect(mockRepository.addLabels).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });

        test('set failed given creating pull request fails', async () => {
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.createPullRequest.mockRejectedValue({});
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(1);
            expect(setFailed).toBeCalledTimes(1);
        });
    });

    describe('given pull request exists', () => {
        test('skip creating pull request', async () => {
            mockFile.search.mockResolvedValue(['some-file']);
            mockRepository.hasChanges.mockReturnValue(true);
            mockRepository.hasPullRequest.mockResolvedValue(true);
            await run();
            expect(mockRepository.createPullRequest).toBeCalledTimes(0);
            expect(setFailed).toBeCalledTimes(0);
        });
    });
});

/**
 * @param {configType} config
 * @typedef configType
 * @property {string} [token]
 * @property {string} [path]
 * @property {string} [transform]
 * @property {string} [branchName]
 * @property {string} [commitTitle]
 * @property {string} [commitBody]
 * @property {string} [commitAuthorName]
 * @property {string} [commitAuthorEmail]
 * @property {string} [gpgPrivateKey]
 * @property {string} [gpgPassphrase]
 * @property {string} [pullRequestTitle]
 * @property {string} [pullRequestBody]
 * @property {string[]} [assignees]
 * @property {string[]} [labels]
 */
const setupInput = (config) => {
    mockInputs.parse.mockReturnValue({
        token: config.token || 'some token',
        path: config.path || PATH.defaultValue,
        transform: config.transform || TRANSFORM.defaultValue,
        branchName: config.branchName || BRANCH_NAME.defaultValue,
        commitTitle: config.commitTitle || COMMIT_TITLE.defaultValue,
        commitBody: config.commitBody || COMMIT_BODY.defaultValue,
        commitAuthorName: config.commitAuthorName || COMMIT_AUTHOR_NAME.defaultValue,
        commitAuthorEmail: config.commitAuthorEmail || COMMIT_AUTHOR_EMAIL.defaultValue,
        gpgPrivateKey: config.gpgPrivateKey || GPG_PRIVATE_KEY.defaultValue,
        gpgPassphrase: config.gpgPassphrase || GPG_PASSPHRASE.defaultValue,
        pullRequestTitle: config.pullRequestTitle || PR_TITLE.defaultValue,
        pullRequestBody: config.pullRequestBody || PR_BODY.defaultValue,
        assignees: config.assignees || [],
        labels: config.labels || [],
    });
};
