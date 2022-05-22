const { setFailed, info } = require('@actions/core')
const { context } = require('@actions/github')

const file = require('./file')
const gpg = require('./gpg')
const inputs = require('./inputs')
const Repository = require('./repository')
const summary = require('./summary')
const transforms = require('./transforms')

const run = async () => {
    try {
        const cwd = process.env.GITHUB_WORKSPACE
        if (cwd === undefined) {
            throw new Error('GitHub Actions has not set the working directory')
        }
        info(`Working directory: ${cwd}`)

        const { owner, repo: repoName } = context.repo
        const {
            token,
            path,
            transform,
            branchName,
            commitTitle,
            commitBody,
            commitAuthorName,
            commitAuthorEmail,
            gpgPrivateKey,
            gpgPassphrase,
            pullRequestTitle,
            pullRequestBody,
            assignees,
            labels,
        } = inputs.parse()

        const repo = new Repository(owner, repoName, token)
        await repo.authenticate(commitAuthorName, commitAuthorEmail)

        if (gpgPrivateKey) {
            if (!gpgPassphrase) {
                throw new Error('No GPG passphrase specified')
            }

            info('Setup GPG to sign commits')
            const keyId = await gpg.importPrivateKey(gpg.cli, inputs.GPG_PRIVATE_KEY.env)
            const gpgProgramFilePath = await gpg.createGpgProgram(inputs.GPG_PASSPHRASE.env)
            await repo.setupGpg(keyId, gpgProgramFilePath)
        }

        const branchExists = await repo.branchExists(branchName)
        info(`Checkout ${branchExists ? 'existing' : 'new'} branch named "${branchName}"`)
        await repo.checkoutBranch(branchName, !branchExists)

        const files = await file.search(path)
        if (files.length === 0) {
            throw new Error(`Found no files matching the path "${singleLine(path)}"`)
        }

        info(`Found ${files.length} file(s) matching the path "${singleLine(path)}"`)

        const currentYear = new Date().getFullYear()
        info(`Current year is "${currentYear}"`)

        for (const file of files) {
            const relativeFile = file.replace(cwd, '.')
            const content = await repo.readFile(file)
            const updatedContent = transforms.applyTransform(transform, content, currentYear, relativeFile)
            if (updatedContent !== content) {
                info(`Update license in "${relativeFile}"`)
                await repo.writeFile(file, updatedContent)
            } else {
                info(`File "${relativeFile}" is already up-to-date`)
            }
        }

        const nbrOfUpdatedFiles = repo.nbrOfChanges()

        if (nbrOfUpdatedFiles === 0) {
            info(`No licenses were updated, let's abort`)
            await summary.writeNoAction(files.length)
            return
        }

        await repo.stageWrittenFiles()

        const commitMessage = commitBody ? `${commitTitle}\n\n${commitBody}` : commitTitle
        await repo.commit(commitMessage)
        await repo.push()

        let pullRequest = await repo.getPullRequest(branchName)
        if (pullRequest === null) {
            info(`Create new pull request with title "${pullRequestTitle}"`)
            const { data } = await repo.createPullRequest(branchName, pullRequestTitle, pullRequestBody)

            pullRequest = data.number

            if (assignees.length > 0) {
                info(`Add assignees to pull request: ${JSON.stringify(assignees)}`)
                await repo.addAssignees(pullRequest, assignees)
            }

            if (labels.length > 0) {
                info(`Add labels to pull request: ${JSON.stringify(labels)}`)
                await repo.addLabels(pullRequest, labels)
            }
        }

        await summary.write(files.length, nbrOfUpdatedFiles, pullRequest)
    } catch (err) {
        // @ts-ignore
        setFailed(err.message)
    }
}

/**
 * @param {string} text
 */
const singleLine = (text) => {
    return text.replace(/\n/g, '\\n')
}

module.exports = {
    run,
}
