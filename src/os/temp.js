const os = require('os');
const path = require('path');

const { runnerTemp } = require('../github-actions-runner/env');

const dir = () => {
    if (runnerTemp) {
        return runnerTemp;
    }
    return os.tmpdir();
};

/**
 * @param {string} fileName
 */
const file = (fileName) => {
    return path.join(dir(), fileName);
};

module.exports = {
    dir,
    file,
};
