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

beforeEach(() => {
    jest.resetAllMocks();
});

describe('#getBranch should', () => {
    test('return branch given branch exists', async () => {
        mockOctokit.git.getRef.mockResolvedValue(GET_REF_SUCCESS_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const actual = await repository.getBranch('master');
        expect(actual).toBe(GET_REF_SUCCESS_RESPONSE);
    });

    test("throw error given branch doesn't exist", async () => {
        mockOctokit.git.createRef.mockRejectedValue(GET_REF_FAILURE_RESPONSE);
        const repository = new Repository('some owner', 'some name', 'some token');
        const fn = repository.getBranch('unknown-branch');
        await expect(fn).rejects.toThrow();
    });
});

describe('#hasBranch should', () => {
    test('return true given branch exists', () => {
        throw Error('Not implemented');
    });

    test("return false given branch doesn't exist", () => {
        throw Error('Not implemented');
    });
});

describe('#createBranch should', () => {
    test('successfully complete', () => {
        throw Error('Not implemented');
    });
});

describe('#getContent should', () => {
    test('return content given file exists', () => {
        throw Error('Not implemented');
    });

    test("throw error given file doesn't exist", () => {
        throw Error('Not implemented');
    });
});

describe('#updateContent should', () => {
    test('successfully complete given file exists', () => {
        throw Error('Not implemented');
    });

    test("throw error given file doesn't exist", () => {
        throw Error('Not implemented');
    });
});

describe('#hasPullRequest should', () => {
    test('return true given pull request exists', () => {
        throw Error('Not implemented');
    });

    test("return false given pull request doesn't exist", () => {
        throw Error('Not implemented');
    });
});

describe('#createPullRequest should', () => {
    test('successfully complete given source branch exists', () => {
        throw Error('Not implemented');
    });

    test("throw error given source branch doesn't exist", () => {
        throw Error('Not implemented');
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

// jest.mock('@actions/core', () => ({
//     getInput: jest.fn().mockReturnValue('some token'),
//     setFailed: jest.fn(),
// }));

// jest.mock('@actions/github', () => ({
//     context: {
//         repo: {
//             owner: 'FantasticFiasco',
//             repo: 'action-update-license-year',
//         },
//     },
//     getOctokit: jest.fn().mockReturnValue({
//         git: {
//             createRef: jest.fn(),
//             getRef: jest.fn(),
//         },
//         repos: {
//             getContent: jest.fn(),
//             createOrUpdateFileContents: jest.fn(),
//         },
//         pulls: {
//             list: jest.fn(),
//             create: jest.fn(),
//         },
//     }),
// }));

// jest.mock('../src/license', () => ({
//     updateLicense: jest.fn(),
// }));

// const res = {
//     git: {
//         getRef: {
//             success: Promise.resolve({
//                 status: 200,
//                 data: {
//                     object: {
//                         sha: 'some sha',
//                     },
//                 },
//             }),
//             failure: Promise.reject({
//                 status: 404,
//             }),
//         },
//         getContent: {
//             success: {
//                 data: {
//                     content: Buffer.from('some license').toString('base64'),
//                 },
//             },
//         },
//     },
//     pulls: {
//         list: {
//             notEmpty: {
//                 data: [],
//             },
//         },
//     },
// };
