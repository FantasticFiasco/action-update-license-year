const { info } = require('@actions/core');
const { writeFile } = require('fs').promises;
const { tempFile } = require('../os/temp');

/**
 * @param {string} privateKey
 */
const writePrivateKeyToDisk = async (privateKey) => {
    await writeFile(privateKeyFilePath(), privateKey);
};

/**
 * @param {{importPrivateKey: (filePath: string) => Promise<{stdout: string, stderr: string}>}} cli
 */
const importPrivateKey = async (cli) => {
    const { stdout, stderr } = await cli.importPrivateKey(privateKeyFilePath());
    info('stdout');
    info(stdout);
    info('stderr');
    info(stderr);
};

const privateKeyFilePath = () => {
    return tempFile('git_gpg_private_key.asc');
};

module.exports = {
    writePrivateKeyToDisk,
    importPrivateKey,
};
