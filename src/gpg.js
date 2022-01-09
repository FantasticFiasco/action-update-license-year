const { exec } = require('./process');
const { info } = require('@actions/core');

const version = async () => {
    let cmd = 'gpg --version';
    const { stdout, stderr } = await exec(cmd);
    info(stdout);
    info(stderr);
};

module.exports = {
    version,
};
