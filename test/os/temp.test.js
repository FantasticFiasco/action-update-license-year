import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

import * as temp from '../../src/os/temp.js'

describe('#tempDir should', () => {
    test('return an existing directory', () => {
        const got = temp.dir()
        expect(got).toBeDefined()
        expect(fs.existsSync(got)).toBeTruthy()
    })
})

describe('#tempFile should', () => {
    test('return a file name in the temp directory', () => {
        const got = temp.file('test.txt')
        expect(got).toBeDefined()
        expect(path.dirname(got)).toStrictEqual(temp.dir())
        expect(path.basename(got)).toStrictEqual('test.txt')
    })
})
