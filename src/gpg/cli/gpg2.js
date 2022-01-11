// This file contains functions that wrap the API of gpg2 (OpenPGP part of
// GnuPG)

const { exec } = require('../../os/process');

/**
 * @param {string} filePath
 */
const importPrivateKey = async (filePath) => {
    return exec(`gpg --batch --yes --import ${filePath}`);
};

module.exports = {
    importPrivateKey,
};
