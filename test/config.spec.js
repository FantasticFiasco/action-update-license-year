const mockCore = {
    getInput: jest.fn(),
};
jest.mock('@actions/core', () => {
    return mockCore;
});

const {
    parseConfig,
    CURRENT_YEAR,
    DEFAULT_COMMIT_TITLE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
} = require('../src/config');

describe('#parseConfig should', () => {
    describe('given no configuration', () => {
        test('return default values', () => {
            mockCore.getInput.mockReturnValueOnce('some token'); // Token is required
            const {
                branchName,
                commitTitle,
                commitBody,
                pullRequestTitle,
                pullRequestBody,
                assignees,
                labels,
            } = parseConfig();
            expect(branchName).toBe(`license/copyright-to-${CURRENT_YEAR}`);
            expect(commitTitle).toBe(DEFAULT_COMMIT_TITLE);
            expect(commitBody).toBe(DEFAULT_COMMIT_BODY);
            expect(pullRequestTitle).toBe(DEFAULT_PR_TITLE);
            expect(pullRequestBody).toBe(DEFAULT_PR_BODY);
            expect(assignees).toStrictEqual([]);
            expect(labels).toStrictEqual([]);
        });
    });

    describe('given configuration', () => {
        describe('with token', () => {
            test('returns it', () => {
                mockCore.getInput.mockReturnValueOnce('some token');
                const { token } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('token', { required: true });
                expect(token).toBe('some token');
            });
        });

        describe('with branch name', () => {
            test('returns it', () => {
                getInputSkip(1).mockReturnValueOnce('some-branch-name');
                const { branchName } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('branchName');
                expect(branchName).toBe('some-branch-name');
            });

            test('returns it given "currentYear" variable', () => {
                getInputSkip(1).mockReturnValueOnce('some-branch-name-{{currentYear}}');
                const { branchName } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('branchName');
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                getInputSkip(1).mockReturnValueOnce('some-branch-name-{{ currentYear }}');
                const { branchName } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('branchName');
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('throws error given invalid variable', () => {
                getInputSkip(1).mockReturnValueOnce('some-branch-name-{{invalidVariableName}}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                getInputSkip(1).mockReturnValueOnce('some-branch-name-{{ invalidVariableName }}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with commit title', () => {
            test('returns it', () => {
                getInputSkip(2).mockReturnValueOnce('some commit title');
                const { commitTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitTitle');
                expect(commitTitle).toBe('some commit title');
            });

            test('returns it given "currentYear" variable', () => {
                getInputSkip(2).mockReturnValueOnce('some commit title {{currentYear}}');
                const { commitTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitTitle');
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                getInputSkip(2).mockReturnValueOnce('some commit title {{ currentYear }}');
                const { commitTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitTitle');
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('throws error given invalid variable', () => {
                getInputSkip(2).mockReturnValueOnce('some commit title {{invalidVariableName}}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                getInputSkip(2).mockReturnValueOnce('some commit title {{ invalidVariableName }}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with commit body', () => {
            test('returns it', () => {
                getInputSkip(3).mockReturnValueOnce('some commit body');
                const { commitBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitBody');
                expect(commitBody).toBe('some commit body');
            });

            test('returns it given "currentYear" variable', () => {
                getInputSkip(3).mockReturnValueOnce('some commit body {{currentYear}}');
                const { commitBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitBody');
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                getInputSkip(3).mockReturnValueOnce('some commit body {{ currentYear }}');
                const { commitBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('commitBody');
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('throws error given invalid variable', () => {
                getInputSkip(3).mockReturnValueOnce('some commit body {{invalidVariableName}}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                getInputSkip(3).mockReturnValueOnce('some commit body {{ invalidVariableName }}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with pull request title', () => {
            test('returns it', () => {
                getInputSkip(4).mockReturnValueOnce('some pull request title');
                const { pullRequestTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prTitle');
                expect(pullRequestTitle).toBe('some pull request title');
            });

            test('returns it given "currentYear" variable', () => {
                getInputSkip(4).mockReturnValueOnce('some pull request title {{currentYear}}');
                const { pullRequestTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prTitle');
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                getInputSkip(4).mockReturnValueOnce('some pull request title {{ currentYear }}');
                const { pullRequestTitle } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prTitle');
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('throws error given invalid variable', () => {
                getInputSkip(4).mockReturnValueOnce('some pull request title {{invalidVariableName}}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                getInputSkip(4).mockReturnValueOnce('some pull request title {{ invalidVariableName }}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with pull request body', () => {
            test('returns it', () => {
                getInputSkip(5).mockReturnValueOnce('some pull request body');
                const { pullRequestBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prBody');
                expect(pullRequestBody).toBe('some pull request body');
            });

            test('returns it given "currentYear" variable', () => {
                getInputSkip(5).mockReturnValueOnce('some pull request body {{currentYear}}');
                const { pullRequestBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prBody');
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                getInputSkip(5).mockReturnValueOnce('some pull request body {{ currentYear }}');
                const { pullRequestBody } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('prBody');
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('throws error given invalid variable', () => {
                getInputSkip(5).mockReturnValueOnce('some pull request body {{invalidVariableName}}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                getInputSkip(5).mockReturnValueOnce('some pull request body {{ invalidVariableName }}');
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with assignees', () => {
            test('returns them', () => {
                getInputSkip(6).mockReturnValueOnce('assignee1,assignee2,assignee3');
                const { assignees } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('assignees');
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });

            test('return them given leading and trailing spaces', () => {
                getInputSkip(6).mockReturnValueOnce(' assignee1 , assignee2 , assignee3 ');
                const { assignees } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('assignees');
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });
        });

        describe('with labels', () => {
            test('returns them', () => {
                getInputSkip(7).mockReturnValueOnce('some label 1,some label 2,some label 3');
                const { labels } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('labels');
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });

            test('returns them given leading and trailing spaces', () => {
                getInputSkip(7).mockReturnValueOnce(' some label 1 , some label 2 , some label 3 ');
                const { labels } = parseConfig();
                expect(mockCore.getInput).toBeCalledWith('labels');
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });
        });
    });
});

/**
 * @param {number} count
 */
function getInputSkip(count) {
    for (let i = 0; i < count; i++) {
        mockCore.getInput.mockReturnValueOnce('');
    }
    return mockCore.getInput;
}
