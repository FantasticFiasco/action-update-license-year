const { info } = require('@actions/core');
const { writeFile } = require('fs').promises;
const { join } = require('path');
const { runnerTemp } = require('./github-actions');
const { exec } = require('./process');

const list = async () => {
    const cmd = 'gpg --list-secret-keys --keyid-format=long';
    const { stdout, stderr } = await exec(cmd);
    info(stdout);
    info(stderr);
};

/**
 * @param {string} privateKey
 * @param {string} passphrase
 */
const importPrivateKey = async (privateKey, passphrase) => {
    try {
        info(`GPG: Import private key`);
        const privateKeyFilePath = join(runnerTemp(), 'private.key');
        await writeFile(privateKeyFilePath, privateKey);

        const cmd = `echo '${passphrase}' | gpg --import --batch --passphrase-fd 0 ${privateKeyFilePath}`;
        await exec(cmd);
    } catch (err) {
        // @ts-ignore
        err.message = `Error importing GPG private key: ${err.message}`;
        throw err;
    }
};

module.exports = {
    list,
    importPrivateKey,
};
