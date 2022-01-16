const { readFile, writeFile } = require('fs').promises;
const { tempFile } = require('../os/temp-paths');

const readPrivateKeyFromDisk = async () => {
    const content = await readFile(privateKeyFilePath());
    return content.toString();
};

/**
 * @param {string} privateKey
 */
const writePrivateKeyToDisk = async (privateKey) => {
    await writeFile(privateKeyFilePath(), privateKey, {
        mode: 0o600,
    });
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

const privateKeyFilePath = () => {
    return tempFile('git_gpg_private_key.asc');
};

module.exports = {
    readPrivateKeyFromDisk,
    writePrivateKeyToDisk,
    importPrivateKey,
};
