// This file contains functions that wrap the API of gpg (GnuPG)

const { exec } = require('../../os/process');

/**
 * @param {string} filePath
 */
const importPrivateKey = async (filePath) => {
    return await exec(`gpg --batch --yes --import ${filePath}`);
};

module.exports = {
    importPrivateKey,
};
