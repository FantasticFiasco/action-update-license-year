const { setOutput } = require('@actions/core')

/**
 * @param {number} currentYear
 * @param {string} branchName
 * @param {number} pullRequestNumber
 * @param {string} pullRequestUrl
 */
const set = (currentYear, branchName, pullRequestNumber, pullRequestUrl) => {
    setOutput('currentYear', currentYear)
    setOutput('branchName', branchName)
    setOutput('pullRequestNumber', pullRequestNumber)
    setOutput('pullRequestUrl', pullRequestUrl)
}

module.exports = {
    set,
}
