// This file contains functions that wrap the API of gpg2 (OpenPGP part of
// GnuPG)

const { chmod, writeFile } = require('fs').promises;

/**
 * @param {string} filePath
 * @param {string} passphrase
 */
const createSignScript = async (filePath, passphrase) => {
    const data = `/usr/bin/gpg2 --passphrase '${passphrase}' --batch --no-tty "$@"`;
    await writeFile(filePath, data);
    await chmod(filePath, 0o755);
};

module.exports = {
    createSignScript,
};
