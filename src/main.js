const { setFailed, info } = require('@actions/core')
const { context } = require('@actions/github')

const commits = require('./commits')
const file = require('./file')
const gpg = require('./gpg')
const inputs = require('./inputs')
const outputs = require('./outputs')
const Repository = require('./repository')
const transforms = require('./transforms')

const run = async () => {
    try {
        const cwd = process.env.GITHUB_WORKSPACE
        if (cwd === undefined) {
            throw new Error('GitHub Actions has not set the working directory')
        }
        info(`Working directory: ${cwd}`)

        // Inputs
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
            minCommits,
            minLines,
            excludeAuthors,
            includePathSpecs,
        } = inputs.parse()

        // Authenticate
        const repo = new Repository(owner, repoName, token)
        await repo.authenticate(commitAuthorName, commitAuthorEmail)

        // Setup GPG
        if (gpgPrivateKey) {
            if (!gpgPassphrase) {
                throw new Error('No GPG passphrase specified')
            }

            info('Setup GPG to sign commits')
            const keyId = await gpg.importPrivateKey(gpg.cli, inputs.GPG_PRIVATE_KEY.env)
            const gpgProgramFilePath = await gpg.createGpgProgram(inputs.GPG_PASSPHRASE.env)
            await repo.setupGpg(keyId, gpgProgramFilePath)
        }

        // Define outputs that hasn't been defined yet
        const currentYear = new Date().getFullYear()
        let pullRequestNumber = null
        let pullRequestUrl = null

        // Print current year
        info(`Current year is "${currentYear}"`)

        // Check if meaningful commits exist (when minCommits or minLines is configured)
        if (minCommits > 0 || minLines > 0) {
            info(`Checking for meaningful commits (minCommits: ${minCommits}, minLines: ${minLines})`)
            const { qualifies, commitCount, lineCount } = await commits.checkMeaningfulCommits({
                currentYear,
                minCommits,
                minLines,
                excludeAuthors,
                includePathSpecs,
            })

            info(`Found ${commitCount} qualifying commit(s) with ${lineCount} line(s) changed`)

            if (!qualifies) {
                info(`Thresholds not met (commits: ${commitCount}/${minCommits}, lines: ${lineCount}/${minLines}), skipping license update`)
                return
            }

            info(`Thresholds met, proceeding with license update`)
        }

        // Checkout branch
        const branchExists = await repo.branchExists(branchName)
        info(`Checkout ${branchExists ? 'existing' : 'new'} branch named "${branchName}"`)
        await repo.checkoutBranch(branchName, !branchExists)

        // Search for files to update
        const files = await file.search(path)
        if (files.length === 0) {
            throw new Error(`Found no files matching the path "${singleLine(path)}"`)
        }
        info(`Found ${files.length} file(s) matching the path "${singleLine(path)}"`)

        // Update files
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

        if (!repo.hasChanges()) {
            info(`No licenses were updated, let's abort`)
            return
        }

        // Stage and commit changes
        await repo.stageWrittenFiles()

        const commitMessage = commitBody ? `${commitTitle}\n\n${commitBody}` : commitTitle
        await repo.commit(commitMessage)
        await repo.push()

        // Create pull request if it hasn't already been created
        let pullRequest = await repo.getPullRequest(branchName)
        if (pullRequest) {
            info(`Pull request ${pullRequest.number} with title "${pullRequest.title}" has already been created`)
            pullRequestNumber = pullRequest.number
            pullRequestUrl = pullRequest.html_url
        } else {
            // Create pull request
            info(`Create new pull request with title "${pullRequestTitle}"`)
            const createPullRequestResponse = await repo.createPullRequest(
                branchName,
                pullRequestTitle,
                pullRequestBody,
            )

            if (createPullRequestResponse.status !== 201) {
                throw new Error(`Failed to create pull request: ${createPullRequestResponse.status}`)
            }

            pullRequestNumber = createPullRequestResponse.data.number
            pullRequestUrl = createPullRequestResponse.data.html_url

            // Add assignees
            if (assignees.length > 0) {
                info(`Add assignees to pull request: ${JSON.stringify(assignees)}`)
                await repo.addAssignees(createPullRequestResponse.data.number, assignees)
            }

            // Add labels
            if (labels.length > 0) {
                info(`Add labels to pull request: ${JSON.stringify(labels)}`)
                await repo.addLabels(createPullRequestResponse.data.number, labels)
            }
        }

        // Set outputs
        outputs.set(currentYear, branchName, pullRequestNumber, pullRequestUrl)
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
