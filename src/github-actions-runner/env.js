/**
 * Always set to true.
 */
const ci = process.env.CI

/**
 * The path to a temporary directory on the runner. This directory is emptied at
 * the beginning and end of each job. Note that files will not be removed if the
 * runner's user account does not have permission to delete them.
 */
const runnerTemp = process.env.RUNNER_TEMP

module.exports = {
    ci,
    runnerTemp,
}
