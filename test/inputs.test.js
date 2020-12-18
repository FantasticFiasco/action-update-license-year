const {
    parseInput,
    TOKEN,
    PATH,
    TRANSFORM,
    BRANCH_NAME,
    CURRENT_YEAR,
    COMMIT_TITLE,
    COMMIT_BODY,
    PR_TITLE,
    PR_BODY,
    ASSIGNEES,
    LABELS,
} = require('../src/inputs');

const INPUTS = {
    TOKEN,
    PATH,
    TRANSFORM,
    BRANCH_NAME,
    COMMIT_TITLE,
    COMMIT_BODY,
    PR_TITLE,
    PR_BODY,
    ASSIGNEES,
    LABELS,
};

describe('#parseInput should', () => {
    beforeEach(() => {
        // Let's make sure that all inputs are cleared before each test
        for (const key of Object.keys(INPUTS)) {
            // @ts-ignore
            delete process.env[INPUTS[key].env];
        }
    });

    describe('given no configuration', () => {
        test('throws error given no token', () => {
            const fn = () => parseInput();
            expect(fn).toThrow();
        });

        test('return default values', () => {
            process.env[INPUTS.TOKEN.env] = 'some token';
            const {
                path,
                transform,
                branchName,
                commitTitle,
                commitBody,
                pullRequestTitle,
                pullRequestBody,
                assignees,
                labels,
            } = parseInput();
            expect(path).toBe(PATH.defaultValue);
            expect(transform).toBe(TRANSFORM.defaultValue);
            expect(branchName).toBe(`license/copyright-to-${CURRENT_YEAR}`);
            expect(commitTitle).toBe(COMMIT_TITLE.defaultValue);
            expect(commitBody).toBe(COMMIT_BODY.defaultValue);
            expect(pullRequestTitle).toBe(PR_TITLE.defaultValue);
            expect(pullRequestBody).toBe(PR_BODY.defaultValue);
            expect(assignees).toStrictEqual([]);
            expect(labels).toStrictEqual([]);
        });
    });

    describe('given configuration', () => {
        beforeEach(() => {
            // Token is a required input for all tests
            process.env[INPUTS.TOKEN.env] = 'some token';
        });

        describe('with token', () => {
            test('returns it', () => {
                const { token } = parseInput();
                expect(token).toBe('some token');
            });
        });

        describe('with path', () => {
            test('returns it', () => {
                process.env[INPUTS.PATH.env] = 'some path';
                const { path } = parseInput();
                expect(path).toBe('some path');
            });

            test('returns it given literal styled yaml', () => {
                process.env[INPUTS.PATH.env] = 'some path 1\nsome path 2';
                const { path } = parseInput();
                expect(path).toBe('some path 1\nsome path 2');
            });

            test('returns it given wildcard pattern', () => {
                process.env[INPUTS.PATH.env] = 'some/**/path/*.js';
                const { path } = parseInput();
                expect(path).toBe('some/**/path/*.js');
            });
        });

        describe('with transform', () => {
            test('returns it', () => {
                process.env[INPUTS.TRANSFORM.env] = '(?<from>\\d{4})';
                const { transform } = parseInput();
                expect(transform).toBe('(?<from>\\d{4})');
            });

            test('throws error given no capturing group named "from"', () => {
                process.env[INPUTS.TRANSFORM.env] = 'invalid-transform';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with branch name', () => {
            test('returns it', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name';
                const { branchName } = parseInput();
                expect(branchName).toBe('some-branch-name');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{currentYear}}';
                const { branchName } = parseInput();
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{ currentYear }}';
                const { branchName } = parseInput();
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-${{ github }}';
                const { branchName } = parseInput();
                expect(branchName).toBe('some-branch-name-${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{invalidVariableName}}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{ invalidVariableName }}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with commit title', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title';
                const { commitTitle } = parseInput();
                expect(commitTitle).toBe('some commit title');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{currentYear}}';
                const { commitTitle } = parseInput();
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{ currentYear }}';
                const { commitTitle } = parseInput();
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title ${{ github }}';
                const { commitTitle } = parseInput();
                expect(commitTitle).toBe('some commit title ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{invalidVariableName}}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{ invalidVariableName }}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with commit body', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body';
                const { commitBody } = parseInput();
                expect(commitBody).toBe('some commit body');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{currentYear}}';
                const { commitBody } = parseInput();
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{ currentYear }}';
                const { commitBody } = parseInput();
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body ${{ github }}';
                const { commitBody } = parseInput();
                expect(commitBody).toBe('some commit body ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{invalidVariableName}}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{ invalidVariableName }}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with pull request title', () => {
            test('returns it', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title';
                const { pullRequestTitle } = parseInput();
                expect(pullRequestTitle).toBe('some pull request title');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{currentYear}}';
                const { pullRequestTitle } = parseInput();
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{ currentYear }}';
                const { pullRequestTitle } = parseInput();
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title ${{ github }}';
                const { pullRequestTitle } = parseInput();
                expect(pullRequestTitle).toBe('some pull request title ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{invalidVariableName}}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{ invalidVariableName }}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with pull request body', () => {
            test('returns it', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body';
                const { pullRequestBody } = parseInput();
                expect(pullRequestBody).toBe('some pull request body');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{currentYear}}';
                const { pullRequestBody } = parseInput();
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{ currentYear }}';
                const { pullRequestBody } = parseInput();
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body ${{ github }}';
                const { pullRequestBody } = parseInput();
                expect(pullRequestBody).toBe('some pull request body ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{invalidVariableName}}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{ invalidVariableName }}';
                const fn = () => parseInput();
                expect(fn).toThrow();
            });
        });

        describe('with assignees', () => {
            test('returns them', () => {
                process.env[INPUTS.ASSIGNEES.env] = 'assignee1,assignee2,assignee3';
                const { assignees } = parseInput();
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });

            test('return them given leading and trailing spaces', () => {
                process.env[INPUTS.ASSIGNEES.env] = ' assignee1 , assignee2 , assignee3 ';
                const { assignees } = parseInput();
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });
        });

        describe('with labels', () => {
            test('returns them', () => {
                process.env[INPUTS.LABELS.env] = 'some label 1,some label 2,some label 3';
                const { labels } = parseInput();
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });

            test('returns them given leading and trailing spaces', () => {
                process.env[INPUTS.LABELS.env] = ' some label 1 , some label 2 , some label 3 ';
                const { labels } = parseInput();
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });
        });
    });
});
