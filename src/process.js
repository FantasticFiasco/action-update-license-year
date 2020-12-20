const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

/**
 * @param {string} cmd
 */
const exec = async (cmd) => {
    return await execAsync(cmd);
};

module.exports = {
    exec,
};
