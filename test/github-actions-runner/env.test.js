import { describe, test, expect } from 'vitest'
import fs from 'fs'

import { ci, runnerTemp } from '../../src/github-actions-runner/env.js'

describe('#runnerTemp should', () => {
    test('return an existing directory', () => {
        const got = runnerTemp
        if (ci) {
            expect(got).toBeDefined()
            expect(fs.existsSync(got || '')).toBeTruthy()
        } else {
            expect(got).toBeUndefined()
        }
    })
})
