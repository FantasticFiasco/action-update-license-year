const { setOutput } = require('@actions/core')

/**
 * @param {number} currentYear
 */
const setCurrentYear = (currentYear) => {
    setOutput('currentYear', currentYear)
}

/**
 * @param {string | null} branchName
 */
const setBranchName = (branchName) => {
    setOutput('branchName', branchName)
}

/**
 * @param {number | null} pullRequestNumber
 */
const setPullRequestNumber = (pullRequestNumber) => {
    setOutput('pullRequestNumber', pullRequestNumber)
}

/**
 * @param {string | null} pullRequestUrl
 */
const setPullRequestUrl = (pullRequestUrl) => {
    setOutput('pullRequestUrl', pullRequestUrl)
}

module.exports = {
    setCurrentYear,
    setBranchName,
    setPullRequestNumber,
    setPullRequestUrl,
}
