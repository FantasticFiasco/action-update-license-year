import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import * as processes from '../src/os/processes.js'
import { retry } from './retry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const mockOctokit = {
    rest: {
        pulls: {
            list: vi.fn(),
            create: vi.fn(),
        },
        issues: {
            addAssignees: vi.fn(),
            addLabels: vi.fn(),
        },
    },
}

const mockGithub = {
    getOctokit: () => {
        return mockOctokit
    },
}

vi.mock('@actions/github', () => {
    return mockGithub
})

const { Repository } = await import('../src/repository.js')

// The path to the root of this git repo
const thisRepoDir = path.join(__dirname, '..')

// The path to the root of a temporary local git repository that we can run our tests on
let tempRepoDir = ''

beforeEach(async () => {
    tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repository-'))

    // Let's make the temp repo the working directory
    process.chdir(tempRepoDir)
    await processes.exec('git init --initial-branch main')
    await processes.exec('git config user.name "John Doe"')
    await processes.exec('git config user.email "john.doe@mail.com"')
    await processes.exec('echo "# Test repo" > README.md')
    await processes.exec('git add README.md')
    await processes.exec('git commit -m "docs(readme): add"')

    vi.resetAllMocks()
})

afterEach(async () => {
    await retry(() =>
        fs.promises.rm(tempRepoDir, {
            recursive: true,
        }),
    )

    process.chdir(thisRepoDir)
})

describe('#authenticate should', () => {
    test('configure git name and e-mail', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.authenticate('some-user-name', 'some-user@mail.com')
        const { stdout: username } = await processes.exec('git config user.name')
        expect(username).toBe('some-user-name')
        const { stdout: email } = await processes.exec('git config user.email')
        expect(email).toBe('some-user@mail.com')
    })
})

describe('#setupGpg should', () => {
    test('configure git', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.setupGpg('some-key-id', 'some-gpg-program')
        const { stdout: commitGpgSign } = await processes.exec('git config commit.gpgsign')
        expect(commitGpgSign).toBe('true')
        const { stdout: userSigningKey } = await processes.exec('git config user.signingkey')
        expect(userSigningKey).toBe('some-key-id')
        const { stdout: gpgProgram } = await processes.exec('git config gpg.program')
        expect(gpgProgram).toBe('some-gpg-program')
    })
})

describe('#branchExists should', () => {
    beforeEach(() => {
        // These tests depend on the current repo
        process.chdir(thisRepoDir)
    })

    test('return true given local branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const got = await repo.branchExists('main')
        expect(got).toBe(true)
    })

    test('return true given remote branch exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const got = await repo.branchExists('test/branch-used-in-tests')
        expect(got).toBe(true)
    })

    test("return false given local and remote branch doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const got = await repo.branchExists('some-non-existing-branch')
        expect(got).toBe(false)
    })
})

describe('#checkoutBranch should', () => {
    test('successfully checkout existing branch', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.checkoutBranch('main', false)
    })

    test('successfully checkout new branch', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.checkoutBranch('new-branch', true)
    })
})

describe('#readFile should', () => {
    test('return content given file exists', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const got = await repo.readFile('README.md')
        expect(got).toBe('# Test repo\n')
    })

    test("throw error given file doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.readFile('unknown-file')
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#writeFile should', () => {
    test('write content to file', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const content = '# New title\n'
        await repo.writeFile('README.md', content)
        await expect(repo.readFile('README.md')).resolves.toBe(content)
    })

    test('use utf8 encoding', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const content = 'Álvaro Mondéjar'
        await repo.writeFile('README.md', content)
        await expect(repo.readFile('README.md')).resolves.toBe(content)
    })

    test("throw error given file doesn't exist", async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.writeFile('unknown-file', 'some content')
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#hasChanges should', () => {
    test('return false given no changes', () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const got = repo.hasChanges()
        expect(got).toBe(false)
    })

    test('return true given changes', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.writeFile('README.md', '# New title\n')
        const got = repo.hasChanges()
        expect(got).toBe(true)
    })
})

describe('#stageWrittenFiles should', () => {
    test('complete given no written files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.stageWrittenFiles()
        const { stdout } = await processes.exec('git diff --name-only --cached')
        expect(stdout).toBe('')
    })

    test('complete given written file', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.writeFile('README.md', '# New title\n')
        await repo.stageWrittenFiles()
        const { stdout } = await processes.exec('git diff --name-only --cached')
        expect(stdout).toBe('README.md')
    })
})

describe('#commit should', () => {
    test('complete given staged files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        await repo.writeFile('README.md', '# New title\n')
        await repo.stageWrittenFiles()
        const message = 'some commit message'
        await repo.commit(message)
        const { stdout } = await processes.exec('git log -n 1')
        expect(stdout).toContain(message)
    })

    test('throw error given no staged files', async () => {
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.commit('some commit message')
        expect(promise).rejects.toBeDefined()
    })
})

describe('#getPullRequest should', () => {
    test('return pull request given that it exists', async () => {
        const pr = {
            number: 42,
            html_url: 'https://github.com/some-user/some-repo/pull/42',
        }
        mockOctokit.rest.pulls.list.mockResolvedValue({
            data: [pr],
        })
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.getPullRequest('some-branch')
        await expect(promise).resolves.toBe(pr)
    })

    test("return null given that pull request doesn't exist", async () => {
        mockOctokit.rest.pulls.list.mockResolvedValue({
            data: [],
        })
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.getPullRequest('some-branch')
        await expect(promise).resolves.toBe(null)
    })

    test('throw error given that multiple pull requests exist', async () => {
        const pr1 = {
            number: 42,
            html_url: 'https://github.com/some-user/some-repo/pull/42',
        }
        const pr2 = {
            number: 43,
            html_url: 'https://github.com/some-user/some-repo/pull/43',
        }
        mockOctokit.rest.pulls.list.mockResolvedValue({
            data: [pr1, pr2],
        })
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.getPullRequest('some-branch')
        await expect(promise).rejects.toBeDefined()
    })

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.rest.pulls.list.mockRejectedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.getPullRequest('some-branch')
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#createPullRequest should', () => {
    test('successfully complete', async () => {
        mockOctokit.rest.pulls.create.mockResolvedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.createPullRequest('some-branch', 'some title', 'some body')
        await expect(promise).resolves.toBeDefined()
    })

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.rest.pulls.create.mockRejectedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.createPullRequest('some-branch', 'some title', 'some body')
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#addAssignees should', () => {
    test('successfully complete', async () => {
        mockOctokit.rest.issues.addAssignees.mockResolvedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.addAssignees(42, ['assignee1', 'assignee2', 'assignee3'])
        await expect(promise).resolves.toBeDefined()
    })

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.rest.issues.addAssignees.mockRejectedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.addAssignees(42, ['assignee1', 'assignee2', 'assignee3'])
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#addLabels should', () => {
    test('successfully complete', async () => {
        mockOctokit.rest.issues.addLabels.mockResolvedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.addLabels(42, ['some label 1', 'some label 2', 'some label 3'])
        await expect(promise).resolves.toBeDefined()
    })

    test('throw error given unexpected Octokit error', async () => {
        mockOctokit.rest.issues.addLabels.mockRejectedValue({})
        const repo = new Repository('some owner', 'some name', 'some token')
        const promise = repo.addLabels(42, ['some label 1', 'some label 2', 'some label 3'])
        await expect(promise).rejects.toBeDefined()
    })
})
