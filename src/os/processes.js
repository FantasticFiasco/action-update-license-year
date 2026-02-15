import { promisify } from 'util'
import { exec as execCp } from 'child_process'

const execAsync = promisify(execCp)

/**
 * @param {string} cmd
 * @param {import("child_process").ExecOptions | undefined} options
 */
export const exec = async (cmd, options = undefined) => {
    const { stdout, stderr } = await execAsync(cmd, options)
    return {
        stdout: stdout.toString().trim(),
        stderr: stderr.toString().trim(),
    }
}
