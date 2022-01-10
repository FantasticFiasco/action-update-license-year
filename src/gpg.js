const { exec } = require('./process');
const { info } = require('@actions/core');
const { writeFile } = require('fs').promises;
const { join } = require('path');
const { runnerTemp } = require('./github-actions');

const list = async () => {
    let cmd = 'gpg --list-secret-keys --keyid-format=long';
    const { stdout, stderr } = await exec(cmd);
    info(stdout);
    info(stderr);
};

/**
 * @param {string} privateKey
 * @param {string} passphrase
 */
const importPrivateKey = async (privateKey, passphrase) => {
    const privateKeyFilePath = join(runnerTemp(), 'private.key');
    await writeFile(privateKeyFilePath, privateKey);

    const { stdout, stderr } = await exec('cat ' + privateKeyFilePath);
    info(stdout);
    info(stderr);

    info(privateKey.length.toString());
    info(passphrase.length.toString());
};

module.exports = {
    list,
    importPrivateKey,
};
