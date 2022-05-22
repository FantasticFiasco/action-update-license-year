const { promisify } = require('util')
const execAsync = promisify(require('child_process').exec)

/**
 * @param {string} cmd
 * @param {import("child_process").ExecOptions | undefined} options
 */
const exec = async (cmd, options = undefined) => {
    const { stdout, stderr } = await execAsync(cmd, options)
    return {
        stdout: stdout.toString().trim(),
        stderr: stderr.toString().trim(),
    }
}

module.exports = {
    exec,
}
