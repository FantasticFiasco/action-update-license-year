const { info } = require('@actions/core');
const { writeFile } = require('fs').promises;
const { join } = require('path');
const { runnerTemp } = require('./github-actions');
const { exec } = require('./process');

const list = async () => {
    const cmd = 'gpg --list-secret-keys --keyid-format=long';
    const { stdout, stderr } = await exec(cmd);
    info('list ' + stdout);
    info('list ' + stderr);
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

        let r = await exec(`ls -la ${runnerTemp()}`);
        info('[ls] ' + r.stdout);
        info('[ls] ' + r.stderr);

        const cmd = `echo '${passphrase}' | gpg --import --batch --passphrase-fd 0 ${privateKeyFilePath}`;
        r = await exec(cmd);
        info('[import] ' + r.stdout);
        info('[import] ' + r.stderr);
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
