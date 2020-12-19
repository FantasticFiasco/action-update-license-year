const { create } = require('@actions/glob');

/**
 * @param {string} pattern
 */
async function search(pattern) {
    const globber = await create(pattern);
    const files = await globber.glob();

    return files;
}

module.exports = {
    search,
};
