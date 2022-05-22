const core = require('@actions/core')

/**
 * @param {number} nbrOfFiles
 * @param {number} nbrOfUpdatedFiles
 * @param {number} pullRequest
 */
const write = async (nbrOfFiles, nbrOfUpdatedFiles, pullRequest) => {
    const summary = core.summary.addHeading("We've got some work to do")

    if (nbrOfFiles === 1) {
        summary.addRaw(
            `License was found in 1 file and it had to be updated. Pull request #${pullRequest} contains the changes.`
        )
    } else {
        summary.addRaw(
            `Licenses where found in ${nbrOfFiles} files and ${nbrOfUpdatedFiles} had to be updated. Pull request #${pullRequest} contains the changes.`
        )
    }

    await summary.write()
}

/**
 * @param {number} nbrOfFiles
 */
const writeNoAction = async (nbrOfFiles) => {
    const summary = core.summary.addHeading("Everything's up to date")

    if (nbrOfFiles === 1) {
        summary.addRaw("License was found in 1 file but it didn't need any update.")
    } else {
        summary.addRaw('Licenses where found in {0} files but none had to be updated.')
    }

    await summary.write()
}

module.exports = {
    write,
    writeNoAction,
}
