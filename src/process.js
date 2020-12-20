const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

/**
 * @param {string} cmd
 * @param {import("child_process").ExecOptions | undefined} options
 */
const exec = async (cmd, options = undefined) => {
    return await execAsync(cmd, options);
};

module.exports = {
    exec,
};
