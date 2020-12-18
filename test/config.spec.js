const {
    parseConfig,
    CURRENT_YEAR,
    DEFAULT_COMMIT_TITLE,
    DEFAULT_COMMIT_BODY,
    DEFAULT_PR_TITLE,
    DEFAULT_PR_BODY,
} = require('../src/config');

const INPUT_TOKEN = 'INPUT_TOKEN';
const INPUT_BRANCHNAME = 'INPUT_BRANCHNAME';
const INPUT_COMMITTITLE = 'INPUT_COMMITTITLE';
const INPUT_COMMITBODY = 'INPUT_COMMITBODY';
const INPUT_PRTITLE = 'INPUT_PRTITLE';
const INPUT_PRBODY = 'INPUT_PRBODY';
const INPUT_ASSIGNEES = 'INPUT_ASSIGNEES';
const INPUT_LABELS = 'INPUT_LABELS';

describe('#parseConfig should', () => {
    beforeEach(() => {
        // Let's make sure that all inputs are cleared before each test
        delete process.env[INPUT_TOKEN];
        delete process.env[INPUT_BRANCHNAME];
        delete process.env[INPUT_COMMITTITLE];
        delete process.env[INPUT_COMMITBODY];
        delete process.env[INPUT_PRTITLE];
        delete process.env[INPUT_PRBODY];
        delete process.env[INPUT_ASSIGNEES];
        delete process.env[INPUT_LABELS];
    });

    describe('given no configuration', () => {
        test('throws error given no token', () => {
            const fn = () => parseConfig();
            expect(fn).toThrow();
        });

        test('return default values', () => {
            process.env[INPUT_TOKEN] = 'some token';
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
        beforeEach(() => {
            // Token is a required input for all tests
            process.env[INPUT_TOKEN] = 'some token';
        });

        describe('with token', () => {
            test('returns it', () => {
                const { token } = parseConfig();
                expect(token).toBe('some token');
            });
        });

        // TODO: write tests for "path" and "transform"

        describe('with branch name', () => {
            test('returns it', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name';
                const { branchName } = parseConfig();
                expect(branchName).toBe('some-branch-name');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name-{{currentYear}}';
                const { branchName } = parseConfig();
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name-{{ currentYear }}';
                const { branchName } = parseConfig();
                expect(branchName).toBe(`some-branch-name-${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name-${{ github }}';
                const { branchName } = parseConfig();
                expect(branchName).toBe('some-branch-name-${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name-{{invalidVariableName}}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUT_BRANCHNAME] = 'some-branch-name-{{ invalidVariableName }}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with commit title', () => {
            test('returns it', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title';
                const { commitTitle } = parseConfig();
                expect(commitTitle).toBe('some commit title');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title {{currentYear}}';
                const { commitTitle } = parseConfig();
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title {{ currentYear }}';
                const { commitTitle } = parseConfig();
                expect(commitTitle).toBe(`some commit title ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title ${{ github }}';
                const { commitTitle } = parseConfig();
                expect(commitTitle).toBe('some commit title ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title {{invalidVariableName}}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUT_COMMITTITLE] = 'some commit title {{ invalidVariableName }}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with commit body', () => {
            test('returns it', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body';
                const { commitBody } = parseConfig();
                expect(commitBody).toBe('some commit body');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body {{currentYear}}';
                const { commitBody } = parseConfig();
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body {{ currentYear }}';
                const { commitBody } = parseConfig();
                expect(commitBody).toBe(`some commit body ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body ${{ github }}';
                const { commitBody } = parseConfig();
                expect(commitBody).toBe('some commit body ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body {{invalidVariableName}}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUT_COMMITBODY] = 'some commit body {{ invalidVariableName }}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with pull request title', () => {
            test('returns it', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title';
                const { pullRequestTitle } = parseConfig();
                expect(pullRequestTitle).toBe('some pull request title');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title {{currentYear}}';
                const { pullRequestTitle } = parseConfig();
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title {{ currentYear }}';
                const { pullRequestTitle } = parseConfig();
                expect(pullRequestTitle).toBe(`some pull request title ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title ${{ github }}';
                const { pullRequestTitle } = parseConfig();
                expect(pullRequestTitle).toBe('some pull request title ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title {{invalidVariableName}}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUT_PRTITLE] = 'some pull request title {{ invalidVariableName }}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with pull request body', () => {
            test('returns it', () => {
                process.env[INPUT_PRBODY] = 'some pull request body';
                const { pullRequestBody } = parseConfig();
                expect(pullRequestBody).toBe('some pull request body');
            });

            test('returns it given "currentYear" variable', () => {
                process.env[INPUT_PRBODY] = 'some pull request body {{currentYear}}';
                const { pullRequestBody } = parseConfig();
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUT_PRBODY] = 'some pull request body {{ currentYear }}';
                const { pullRequestBody } = parseConfig();
                expect(pullRequestBody).toBe(`some pull request body ${CURRENT_YEAR}`);
            });

            test('returns it given GitHub Action variable', () => {
                process.env[INPUT_PRBODY] = 'some pull request body ${{ github }}';
                const { pullRequestBody } = parseConfig();
                expect(pullRequestBody).toBe('some pull request body ${{ github }}');
            });

            test('throws error given invalid variable', () => {
                process.env[INPUT_PRBODY] = 'some pull request body {{invalidVariableName}}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUT_PRBODY] = 'some pull request body {{ invalidVariableName }}';
                const fn = () => parseConfig();
                expect(fn).toThrow();
            });
        });

        describe('with assignees', () => {
            test('returns them', () => {
                process.env[INPUT_ASSIGNEES] = 'assignee1,assignee2,assignee3';
                const { assignees } = parseConfig();
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });

            test('return them given leading and trailing spaces', () => {
                process.env[INPUT_ASSIGNEES] = ' assignee1 , assignee2 , assignee3 ';
                const { assignees } = parseConfig();
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3']);
            });
        });

        describe('with labels', () => {
            test('returns them', () => {
                process.env[INPUT_LABELS] = 'some label 1,some label 2,some label 3';
                const { labels } = parseConfig();
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });

            test('returns them given leading and trailing spaces', () => {
                process.env[INPUT_LABELS] = ' some label 1 , some label 2 , some label 3 ';
                const { labels } = parseConfig();
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3']);
            });
        });
    });
});
