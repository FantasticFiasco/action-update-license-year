import { writeFile } from 'fs/promises'

import { exec } from './os/processes.js'
import { file } from './os/temp.js'

/**
 * @param {{importPrivateKey: (privateKey: string) => Promise<{stdout: string, stderr: string}>}} cli
 * @param {string} privateKeyEnvName
 * @returns The key id
 */
export const importPrivateKey = async (cli, privateKeyEnvName) => {
    const { stderr } = await cli.importPrivateKey(privateKeyEnvName)
    const regex = /gpg: key ([0123456789ABCDEF]*): secret key imported/
    const match = regex.exec(stderr)
    if (match === null || match.length !== 2) {
        throw new Error(`Import private GPG key failed: ${stderr}`)
    }

    return match[1]
}

const cli = {
    importPrivateKey: async function (/** @type {string} */ privateKeyEnvName) {
        const filePath = file('gpg_import')

        // Node.js is running processes using sh, but in this case we need support for process
        // substitution. That's the reason for the shebang workaround.
        const data = `#!/bin/bash\n\ngpg2 --batch --yes --import <(echo "$${privateKeyEnvName}")`
        await writeFile(filePath, data, {
            mode: 0o700,
        })

        return await exec(filePath, {
            env: {
                ...process.env,
                privateKeyEnvName: process.env[privateKeyEnvName],
            },
        })
    },
}

/**
 * @param {string} passphraseEnvName
 * @returns The GPG program file path
 */
export const createGpgProgram = async (passphraseEnvName) => {
    const filePath = file('git_gpg_signer')
    const data = `gpg2 --pinentry-mode loopback --passphrase "$${passphraseEnvName}" --no-tty "$@"`
    await writeFile(filePath, data, {
        mode: 0o700,
    })
    return filePath
}

export { cli }
