const processes = require('./os/processes')

/**
 * Checks if there are meaningful commits in the current year based on configured thresholds.
 *
 * @param {Object} options
 * @param {number} options.currentYear - The current year
 * @param {number} options.minCommits - Minimum number of commits required (0 to disable)
 * @param {number} options.minLines - Minimum lines changed required (0 to disable)
 * @param {string} options.excludeAuthors - Regex pattern to exclude authors
 * @param {string[]} options.includePathSpecs - Pathspecs to filter commits
 * @returns {Promise<{qualifies: boolean, commitCount: number, lineCount: number}>}
 */
const checkMeaningfulCommits = async ({ currentYear, minCommits, minLines, excludeAuthors, includePathSpecs }) => {
    // If both thresholds are disabled, always qualify
    if (minCommits === 0 && minLines === 0) {
        return { qualifies: true, commitCount: 0, lineCount: 0 }
    }

    const since = `${currentYear}-01-01`

    // Get commits with author info and stats
    const commits = await getCommitsWithStats(since, includePathSpecs)

    // Filter by author if pattern provided
    const filteredCommits = filterByAuthor(commits, excludeAuthors)

    const commitCount = filteredCommits.length
    const lineCount = filteredCommits.reduce((sum, commit) => sum + commit.linesChanged, 0)

    const meetsCommitThreshold = minCommits === 0 || commitCount >= minCommits
    const meetsLineThreshold = minLines === 0 || lineCount >= minLines

    return {
        qualifies: meetsCommitThreshold && meetsLineThreshold,
        commitCount,
        lineCount,
    }
}

/**
 * Get commits with their stats (author and lines changed)
 *
 * @param {string} since - Date string for --since
 * @param {string[]} pathSpecs - Pathspecs to filter commits
 * @returns {Promise<Array<{hash: string, author: string, linesChanged: number}>>}
 */
const getCommitsWithStats = async (since, pathSpecs) => {
    // Use --numstat to get line counts and --format to get author info
    // Format: hash|author|email followed by numstat lines
    const args = [
        'log',
        '--no-merges',
        `--since=${since}`,
        '--format=%H|%an|%ae',
        '--numstat',
    ]

    if (pathSpecs.length > 0) {
        args.push('--')
        args.push(...pathSpecs)
    }

    const { stdout } = await processes.exec(`git ${args.map(escapeArg).join(' ')}`)

    if (!stdout) {
        return []
    }

    return parseGitLogOutput(stdout)
}

/**
 * Parse git log output with numstat
 *
 * @param {string} output - Raw git log output
 * @returns {Array<{hash: string, author: string, linesChanged: number}>}
 */
const parseGitLogOutput = (output) => {
    const commits = []
    const lines = output.split('\n')

    let currentCommit = null

    for (const line of lines) {
        if (!line) continue

        // Check if this is a commit header line (hash|author|email)
        if (line.includes('|')) {
            const parts = line.split('|')
            if (parts.length >= 3 && parts[0].match(/^[a-f0-9]{40}$/)) {
                if (currentCommit) {
                    commits.push(currentCommit)
                }
                currentCommit = {
                    hash: parts[0],
                    author: `${parts[1]} <${parts[2]}>`,
                    linesChanged: 0,
                }
                continue
            }
        }

        // Check if this is a numstat line (additions\tdeletions\tfilename)
        if (currentCommit) {
            const statMatch = line.match(/^(\d+|-)\t(\d+|-)\t/)
            if (statMatch) {
                const additions = statMatch[1] === '-' ? 0 : parseInt(statMatch[1], 10)
                const deletions = statMatch[2] === '-' ? 0 : parseInt(statMatch[2], 10)
                currentCommit.linesChanged += additions + deletions
            }
        }
    }

    if (currentCommit) {
        commits.push(currentCommit)
    }

    return commits
}

/**
 * Filter commits by author pattern
 *
 * @param {Array<{hash: string, author: string, linesChanged: number}>} commits
 * @param {string} excludePattern - Regex pattern to exclude authors
 * @returns {Array<{hash: string, author: string, linesChanged: number}>}
 */
const filterByAuthor = (commits, excludePattern) => {
    if (!excludePattern) {
        return commits
    }

    const regex = new RegExp(excludePattern, 'i')
    return commits.filter((commit) => !regex.test(commit.author))
}

/**
 * Escape shell argument
 *
 * @param {string} arg
 * @returns {string}
 */
const escapeArg = (arg) => {
    // If arg contains special characters, wrap in quotes
    if (arg.includes(' ') || arg.includes('*') || arg.includes('!') || arg.includes(':')) {
        return `"${arg.replace(/"/g, '\\"')}"`
    }
    return arg
}

module.exports = {
    checkMeaningfulCommits,
    // Export for testing
    parseGitLogOutput,
    filterByAuthor,
}
