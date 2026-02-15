import { describe, test, expect, beforeEach } from 'vitest'
import * as inputs from '../src/inputs.js'

const INPUTS = {
    TOKEN: inputs.TOKEN,
    PATH: inputs.PATH,
    TRANSFORM: inputs.TRANSFORM,
    BRANCH_NAME: inputs.BRANCH_NAME,
    COMMIT_TITLE: inputs.COMMIT_TITLE,
    COMMIT_BODY: inputs.COMMIT_BODY,
    COMMIT_AUTHOR_NAME: inputs.COMMIT_AUTHOR_NAME,
    COMMIT_AUTHOR_EMAIL: inputs.COMMIT_AUTHOR_EMAIL,
    PR_TITLE: inputs.PR_TITLE,
    PR_BODY: inputs.PR_BODY,
    ASSIGNEES: inputs.ASSIGNEES,
    LABELS: inputs.LABELS,
}

describe('#parse should', () => {
    beforeEach(() => {
        // Let's make sure that all inputs are cleared before each test
        for (const key of Object.keys(INPUTS)) {
            // @ts-ignore
            delete process.env[INPUTS[key].env]
        }
    })

    describe('given no configuration', () => {
        test('throw error given no token', () => {
            const fn = () => inputs.parse()
            expect(fn).toThrow()
        })

        test('return default values', () => {
            process.env[INPUTS.TOKEN.env] = 'some token'
            const {
                path,
                transform,
                branchName,
                commitTitle,
                commitBody,
                commitAuthorName,
                commitAuthorEmail,
                pullRequestTitle,
                pullRequestBody,
                assignees,
                labels,
            } = inputs.parse()
            expect(path).toBe(inputs.PATH.defaultValue)
            expect(transform).toBe(inputs.TRANSFORM.defaultValue)
            expect(branchName).toBe(`license/copyright-to-${inputs.CURRENT_YEAR}`)
            expect(commitTitle).toBe(inputs.COMMIT_TITLE.defaultValue)
            expect(commitBody).toBe(inputs.COMMIT_BODY.defaultValue)
            expect(commitAuthorName).toBe(inputs.COMMIT_AUTHOR_NAME.defaultValue)
            expect(commitAuthorEmail).toBe(inputs.COMMIT_AUTHOR_EMAIL.defaultValue)
            expect(pullRequestTitle).toBe(inputs.PR_TITLE.defaultValue)
            expect(pullRequestBody).toBe(inputs.PR_BODY.defaultValue)
            expect(assignees).toStrictEqual([])
            expect(labels).toStrictEqual([])
        })
    })

    describe('given configuration', () => {
        beforeEach(() => {
            // Token is a required input for all tests
            process.env[INPUTS.TOKEN.env] = 'some token'
        })

        describe('with token', () => {
            test('returns it', () => {
                const { token } = inputs.parse()
                expect(token).toBe('some token')
            })
        })

        describe('with path', () => {
            test('returns it', () => {
                process.env[INPUTS.PATH.env] = 'some path'
                const { path } = inputs.parse()
                expect(path).toBe('some path')
            })

            test('returns it given literal styled yaml', () => {
                process.env[INPUTS.PATH.env] = 'some path 1\nsome path 2'
                const { path } = inputs.parse()
                expect(path).toBe('some path 1\nsome path 2')
            })

            test('returns it given wildcard pattern', () => {
                process.env[INPUTS.PATH.env] = 'some/**/path/*.js'
                const { path } = inputs.parse()
                expect(path).toBe('some/**/path/*.js')
            })
        })

        describe('with transform', () => {
            test('returns it', () => {
                process.env[INPUTS.TRANSFORM.env] = '(?<from>\\d{4})'
                const { transform } = inputs.parse()
                expect(transform).toBe('(?<from>\\d{4})')
            })

            test('throws error given no capturing group named "from"', () => {
                process.env[INPUTS.TRANSFORM.env] = 'invalid-transform'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with branch name', () => {
            test('returns it', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name'
                const { branchName } = inputs.parse()
                expect(branchName).toBe('some-branch-name')
            })

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{currentYear}}'
                const { branchName } = inputs.parse()
                expect(branchName).toBe(`some-branch-name-${inputs.CURRENT_YEAR}`)
            })

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{ currentYear }}'
                const { branchName } = inputs.parse()
                expect(branchName).toBe(`some-branch-name-${inputs.CURRENT_YEAR}`)
            })

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-${{ github }}'
                const { branchName } = inputs.parse()
                expect(branchName).toBe('some-branch-name-${{ github }}')
            })

            test('throws error given invalid variable', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{invalidVariableName}}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.BRANCH_NAME.env] = 'some-branch-name-{{ invalidVariableName }}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with commit title', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title'
                const { commitTitle } = inputs.parse()
                expect(commitTitle).toBe('some commit title')
            })

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{currentYear}}'
                const { commitTitle } = inputs.parse()
                expect(commitTitle).toBe(`some commit title ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{ currentYear }}'
                const { commitTitle } = inputs.parse()
                expect(commitTitle).toBe(`some commit title ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title ${{ github }}'
                const { commitTitle } = inputs.parse()
                expect(commitTitle).toBe('some commit title ${{ github }}')
            })

            test('throws error given invalid variable', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{invalidVariableName}}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_TITLE.env] = 'some commit title {{ invalidVariableName }}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with commit body', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body'
                const { commitBody } = inputs.parse()
                expect(commitBody).toBe('some commit body')
            })

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{currentYear}}'
                const { commitBody } = inputs.parse()
                expect(commitBody).toBe(`some commit body ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{ currentYear }}'
                const { commitBody } = inputs.parse()
                expect(commitBody).toBe(`some commit body ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body ${{ github }}'
                const { commitBody } = inputs.parse()
                expect(commitBody).toBe('some commit body ${{ github }}')
            })

            test('throws error given invalid variable', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{invalidVariableName}}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.COMMIT_BODY.env] = 'some commit body {{ invalidVariableName }}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with commit author name', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_AUTHOR_NAME.env] = 'some commit author name'
                const { commitAuthorName } = inputs.parse()
                expect(commitAuthorName).toBe('some commit author name')
            })
        })

        describe('with commit author e-mail', () => {
            test('returns it', () => {
                process.env[INPUTS.COMMIT_AUTHOR_EMAIL.env] = 'some commit author e-mail'
                const { commitAuthorEmail } = inputs.parse()
                expect(commitAuthorEmail).toBe('some commit author e-mail')
            })
        })

        describe('with pull request title', () => {
            test('returns it', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title'
                const { pullRequestTitle } = inputs.parse()
                expect(pullRequestTitle).toBe('some pull request title')
            })

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{currentYear}}'
                const { pullRequestTitle } = inputs.parse()
                expect(pullRequestTitle).toBe(`some pull request title ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{ currentYear }}'
                const { pullRequestTitle } = inputs.parse()
                expect(pullRequestTitle).toBe(`some pull request title ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title ${{ github }}'
                const { pullRequestTitle } = inputs.parse()
                expect(pullRequestTitle).toBe('some pull request title ${{ github }}')
            })

            test('throws error given invalid variable', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{invalidVariableName}}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_TITLE.env] = 'some pull request title {{ invalidVariableName }}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with pull request body', () => {
            test('returns it', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body'
                const { pullRequestBody } = inputs.parse()
                expect(pullRequestBody).toBe('some pull request body')
            })

            test('returns it given "currentYear" variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{currentYear}}'
                const { pullRequestBody } = inputs.parse()
                expect(pullRequestBody).toBe(`some pull request body ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given "currentYear" variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{ currentYear }}'
                const { pullRequestBody } = inputs.parse()
                expect(pullRequestBody).toBe(`some pull request body ${inputs.CURRENT_YEAR}`)
            })

            test('returns it given GitHub Action variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body ${{ github }}'
                const { pullRequestBody } = inputs.parse()
                expect(pullRequestBody).toBe('some pull request body ${{ github }}')
            })

            test('throws error given invalid variable', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{invalidVariableName}}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })

            test('throws error given invalid variable with leading and trailing spaces', () => {
                process.env[INPUTS.PR_BODY.env] = 'some pull request body {{ invalidVariableName }}'
                const fn = () => inputs.parse()
                expect(fn).toThrow()
            })
        })

        describe('with assignees', () => {
            test('returns them', () => {
                process.env[INPUTS.ASSIGNEES.env] = 'assignee1,assignee2,assignee3'
                const { assignees } = inputs.parse()
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3'])
            })

            test('return them given leading and trailing spaces', () => {
                process.env[INPUTS.ASSIGNEES.env] = ' assignee1 , assignee2 , assignee3 '
                const { assignees } = inputs.parse()
                expect(assignees).toStrictEqual(['assignee1', 'assignee2', 'assignee3'])
            })
        })

        describe('with labels', () => {
            test('returns them', () => {
                process.env[INPUTS.LABELS.env] = 'some label 1,some label 2,some label 3'
                const { labels } = inputs.parse()
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3'])
            })

            test('returns them given leading and trailing spaces', () => {
                process.env[INPUTS.LABELS.env] = ' some label 1 , some label 2 , some label 3 '
                const { labels } = inputs.parse()
                expect(labels).toStrictEqual(['some label 1', 'some label 2', 'some label 3'])
            })
        })
    })
})
