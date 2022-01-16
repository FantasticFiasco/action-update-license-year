const fs = require('fs').promises;

const processes = require('./os/processes');
const temp = require('./os/temp');

const readPrivateKeyFromDisk = async () => {
    const content = await fs.readFile(privateKeyFilePath());
    return content.toString();
};

/**
 * @param {string} privateKey
 */
const writePrivateKeyToDisk = async (privateKey) => {
    await fs.writeFile(privateKeyFilePath(), privateKey, {
        mode: 0o600,
    });
};

const deletePrivateKeyFromDisk = async () => {
    await fs.unlink(privateKeyFilePath());
};

/**
 * @param {{importPrivateKey: (filePath: string) => Promise<{stdout: string, stderr: string}>}} cli
 * @returns The key id
 */
const importPrivateKey = async (cli) => {
    const { stderr } = await cli.importPrivateKey(privateKeyFilePath());
    const regex = /gpg: key ([0123456789ABCDEF]*): secret key imported/;
    const match = regex.exec(stderr);
    if (match === null || match.length !== 2) {
        throw new Error(`Import private GPG key failed: ${stderr}`);
    }

    return match[1];
};

/**
 * @param {string} filePath
 * @param {string} passphrase
 */
const createSignScript = async (filePath, passphrase) => {
    const data = `gpg2 --pinentry-mode loopback --passphrase '${passphrase}' --no-tty "$@"`;
    await fs.writeFile(filePath, data, {
        mode: 0o700,
    });
};

const privateKeyFilePath = () => {
    return temp.file('git_gpg_private_key.asc');
};

const defaultCli = {
    importPrivateKey: async (/** @type {string} */ filePath) => {
        return await processes.exec(`gpg2 --batch --yes --import '${filePath}'`);
    },
};

module.exports = {
    readPrivateKeyFromDisk,
    writePrivateKeyToDisk,
    deletePrivateKeyFromDisk,
    importPrivateKey,
    createSignScript,
    defaultCli,
};
