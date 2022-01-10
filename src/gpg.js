const { exec } = require('./process');
const { info } = require('@actions/core');

const list = async () => {
    let cmd = 'gpg --list-secret-keys --keyid-format=long';
    const { stdout, stderr } = await exec(cmd);
    info(stdout);
    info(stderr);
};

module.exports = {
    list,
};
