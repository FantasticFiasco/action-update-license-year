import { vi, describe, test, expect } from 'vitest'

// @actions/core
const mockCore = {
    setOutput: vi.fn(),
}
vi.mock('@actions/core', () => {
    return mockCore
})

const outputs = await import('../src/outputs.js')

describe('#set should', () => {
    test('correctly set all outputs', () => {
        const currentYear = 2023
        const branchName = 'some-branch-name'
        const pullRequestNumber = 42
        const pullRequestUrl = 'https://github.com/some-user/some-repo/pull/42'
        outputs.set(currentYear, branchName, pullRequestNumber, pullRequestUrl)
        expect(mockCore.setOutput).toHaveBeenCalledWith('currentYear', currentYear)
        expect(mockCore.setOutput).toHaveBeenCalledWith('branchName', branchName)
        expect(mockCore.setOutput).toHaveBeenCalledWith('pullRequestNumber', pullRequestNumber)
        expect(mockCore.setOutput).toHaveBeenCalledWith('pullRequestUrl', pullRequestUrl)
    })
})
