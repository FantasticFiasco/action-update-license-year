const fs = require('fs').promises;

const processes = require('./os/processes');
const temp = require('./os/temp');

/**
 * @param {{importPrivateKey: (privateKey: string) => Promise<{stdout: string, stderr: string}>}} cli
 * @param {string} privateKey
 * @returns The key id
 */
const importPrivateKey = async (cli, privateKey) => {
    const { stderr } = await cli.importPrivateKey(privateKey);
    const regex = /gpg: key ([0123456789ABCDEF]*): secret key imported/;
    const match = regex.exec(stderr);
    if (match === null || match.length !== 2) {
        throw new Error(`Import private GPG key failed: ${stderr}`);
    }

    return match[1];
};

/**
 * @param {string} passphraseEnvName
 * @returns The GPG program file path
 */
const createGpgProgram = async (passphraseEnvName) => {
    const filePath = temp.file('git_gpg_sign');
    const data = `gpg2 --pinentry-mode loopback --passphrase "$${passphraseEnvName}" --no-tty "$@"`;
    await fs.writeFile(filePath, data, {
        mode: 0o700,
    });
    return filePath;
};

const cli = {
    importPrivateKey: async function (/** @type {string} */ privateKey) {
        return await processes.exec(`gpg2 --batch --yes --import <(echo "${privateKey}")`);
    },
};

module.exports = {
    importPrivateKey,
    createGpgProgram,
    cli,
};
