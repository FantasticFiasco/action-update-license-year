// This file contains functions that wrap the API of gpg2 (OpenPGP part of
// GnuPG)

const { writeFile } = require('fs').promises;

/**
 * @param {string} filePath
 * @param {string} passphrase
 */
const createSignScript = async (filePath, passphrase) => {
    const data = `/usr/bin/gpg2 --pinentry-mode loopback --passphrase '${passphrase}' --no-tty "$@"`;
    await writeFile(filePath, data, {
        mode: 0o700,
    });
};

module.exports = {
    createSignScript,
};
