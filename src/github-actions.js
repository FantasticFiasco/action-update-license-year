/**
 * The path to a temporary directory on the runner. This directory is emptied at
 * the beginning and end of each job. Note that files will not be removed if the
 * runner's user account does not have permission to delete them.
 */
const runnerTemp = () => {
    const value = process.env.RUNNER_TEMP;
    if (!value) {
        throw new Error('GitHub Actions has not set the RUNNER_TEMP environment variable');
    }
    return value;
};

module.exports = {
    runnerTemp,
};
