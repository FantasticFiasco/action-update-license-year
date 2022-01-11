const { tmpdir } = require('os');
const { join } = require('path');
const { runnerTemp } = require('../github-actions-runner/env');

const tempDir = () => {
    if (runnerTemp) {
        return runnerTemp;
    }

    return tmpdir();
};

/**
 * @param {string} fileName
 */
const tempFile = (fileName) => {
    return join(tempDir(), fileName);
};

module.exports = {
    tempDir,
    tempFile,
};
