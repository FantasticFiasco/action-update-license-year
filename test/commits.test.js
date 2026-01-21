const mockProcesses = {
    exec: jest.fn(),
}
jest.mock('../src/os/processes', () => {
    return mockProcesses
})

const { checkMeaningfulCommits, parseGitLogOutput, filterByAuthor } = require('../src/commits')

describe('commits module', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('parseGitLogOutput', () => {
        // Use exactly 40 character hex strings for git hashes
        const HASH1 = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
        const HASH2 = 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3'

        test('parses empty output', () => {
            const result = parseGitLogOutput('')
            expect(result).toEqual([])
        })

        test('parses single commit with stats', () => {
            const output = `${HASH1}|John Doe|john@example.com
10\t5\tfile1.js
20\t10\tfile2.js`
            const result = parseGitLogOutput(output)
            expect(result).toEqual([
                {
                    hash: HASH1,
                    author: 'John Doe <john@example.com>',
                    linesChanged: 45,
                },
            ])
        })

        test('parses multiple commits with stats', () => {
            const output = `${HASH1}|John Doe|john@example.com
10\t5\tfile1.js

${HASH2}|Jane Smith|jane@example.com
3\t2\tfile2.js
1\t1\tfile3.js`
            const result = parseGitLogOutput(output)
            expect(result).toEqual([
                {
                    hash: HASH1,
                    author: 'John Doe <john@example.com>',
                    linesChanged: 15,
                },
                {
                    hash: HASH2,
                    author: 'Jane Smith <jane@example.com>',
                    linesChanged: 7,
                },
            ])
        })

        test('handles binary files with - stats', () => {
            const output = `${HASH1}|John Doe|john@example.com
-\t-\timage.png
10\t5\tfile1.js`
            const result = parseGitLogOutput(output)
            expect(result).toEqual([
                {
                    hash: HASH1,
                    author: 'John Doe <john@example.com>',
                    linesChanged: 15,
                },
            ])
        })
    })

    describe('filterByAuthor', () => {
        const commits = [
            { hash: 'abc', author: 'John Doe <john@example.com>', linesChanged: 10 },
            { hash: 'def', author: 'dependabot[bot] <dependabot@github.com>', linesChanged: 5 },
            { hash: 'ghi', author: 'Jane Smith <jane@example.com>', linesChanged: 20 },
            { hash: 'jkl', author: 'renovate[bot] <renovate@example.com>', linesChanged: 3 },
        ]

        test('returns all commits when no pattern', () => {
            const result = filterByAuthor(commits, '')
            expect(result).toEqual(commits)
        })

        test('filters out matching authors', () => {
            const result = filterByAuthor(commits, 'dependabot|renovate')
            expect(result).toEqual([
                { hash: 'abc', author: 'John Doe <john@example.com>', linesChanged: 10 },
                { hash: 'ghi', author: 'Jane Smith <jane@example.com>', linesChanged: 20 },
            ])
        })

        test('is case insensitive', () => {
            const result = filterByAuthor(commits, 'DEPENDABOT')
            expect(result).toEqual([
                { hash: 'abc', author: 'John Doe <john@example.com>', linesChanged: 10 },
                { hash: 'ghi', author: 'Jane Smith <jane@example.com>', linesChanged: 20 },
                { hash: 'jkl', author: 'renovate[bot] <renovate@example.com>', linesChanged: 3 },
            ])
        })
    })

    describe('checkMeaningfulCommits', () => {
        // Use exactly 40 character hex strings for git hashes
        const HASH1 = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
        const HASH2 = 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3'

        test('returns qualifies=true when thresholds are disabled', async () => {
            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 0,
                minLines: 0,
                excludeAuthors: '',
                includePathSpecs: [],
            })
            expect(result).toEqual({
                qualifies: true,
                commitCount: 0,
                lineCount: 0,
            })
            expect(mockProcesses.exec).not.toHaveBeenCalled()
        })

        test('returns qualifies=true when minCommits threshold is met', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|John Doe|john@example.com
10\t5\tfile1.js

${HASH2}|Jane Smith|jane@example.com
20\t10\tfile2.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 2,
                minLines: 0,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: true,
                commitCount: 2,
                lineCount: 45,
            })
        })

        test('returns qualifies=false when minCommits threshold not met', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|John Doe|john@example.com
10\t5\tfile1.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 5,
                minLines: 0,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: false,
                commitCount: 1,
                lineCount: 15,
            })
        })

        test('returns qualifies=true when minLines threshold is met', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|John Doe|john@example.com
50\t50\tfile1.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 0,
                minLines: 100,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: true,
                commitCount: 1,
                lineCount: 100,
            })
        })

        test('returns qualifies=false when minLines threshold not met', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|John Doe|john@example.com
10\t5\tfile1.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 0,
                minLines: 100,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: false,
                commitCount: 1,
                lineCount: 15,
            })
        })

        test('filters commits by author before counting', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|dependabot[bot]|dependabot@github.com
100\t50\tpackage.json

${HASH2}|John Doe|john@example.com
10\t5\tfile1.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 1,
                minLines: 0,
                excludeAuthors: 'dependabot',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: true,
                commitCount: 1,
                lineCount: 15,
            })
        })

        test('includes pathspecs in git command', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: '',
                stderr: '',
            })

            await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 1,
                minLines: 0,
                excludeAuthors: '',
                includePathSpecs: ['src/**', 'lib/**'],
            })

            expect(mockProcesses.exec).toHaveBeenCalledWith(
                expect.stringContaining('-- "src/**" "lib/**"'),
            )
        })

        test('uses correct since date for current year', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: '',
                stderr: '',
            })

            await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 1,
                minLines: 0,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(mockProcesses.exec).toHaveBeenCalledWith(
                expect.stringContaining('--since=2025-01-01'),
            )
        })

        test('requires both thresholds to be met when both specified', async () => {
            mockProcesses.exec.mockResolvedValue({
                stdout: `${HASH1}|John Doe|john@example.com
5\t5\tfile1.js`,
                stderr: '',
            })

            const result = await checkMeaningfulCommits({
                currentYear: 2025,
                minCommits: 1,
                minLines: 100,
                excludeAuthors: '',
                includePathSpecs: [],
            })

            expect(result).toEqual({
                qualifies: false,
                commitCount: 1,
                lineCount: 10,
            })
        })
    })
})
