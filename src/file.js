const { create } = require('@actions/glob');
const fs = require('fs');

/**
 * @param {string} pattern
 */
const search = async (pattern) => {
    const globber = await create(pattern);
    const paths = await globber.glob();
    const files = paths.filter((path) => {
        return fs.statSync(path).isFile();
    });

    return files;
};

module.exports = {
    search,
};
