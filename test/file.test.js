import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'

import * as file from '../src/file.js'

describe('#search', () => {
    let tempDir = ''

    beforeAll(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-'))

        // Create the following file structure:
        //
        //   .
        //   |___LICENSE
        //   |___LICENSE-APACHE
        //   |___LICENSE-MIT
        //   |___LICENSE.md
        //   |___packages
        //     |___a
        //     | |___index.js
        //     | |___LICENSE
        //     |___b
        //     | |___index.js
        //     | |___LICENSE
        //     |___c
        //       |___index.js
        //       |___LICENSE

        // ./
        fs.writeFileSync(path.join(tempDir, 'LICENSE'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'LICENSE-APACHE'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'LICENSE-MIT'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'LICENSE.md'), 'some content')

        // ./packages
        fs.mkdirSync(path.join(tempDir, 'packages'))

        // ./packages/a
        fs.mkdirSync(path.join(tempDir, 'packages', 'a'))
        fs.writeFileSync(path.join(tempDir, 'packages', 'a', 'LICENSE'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'packages', 'a', 'index.js'), 'some content')

        // ./packages/b
        fs.mkdirSync(path.join(tempDir, 'packages', 'b'))
        fs.writeFileSync(path.join(tempDir, 'packages', 'b', 'LICENSE'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'packages', 'b', 'index.js'), 'some content')

        // ./packages/c
        fs.mkdirSync(path.join(tempDir, 'packages', 'c'))
        fs.writeFileSync(path.join(tempDir, 'packages', 'c', 'LICENSE'), 'some content')
        fs.writeFileSync(path.join(tempDir, 'packages', 'c', 'index.js'), 'some content')
    })

    afterAll(async () => {
        await fs.promises.rm(tempDir, {
            recursive: true,
        })
    })

    test('should return file given path', async () => {
        const pattern = path.join(tempDir, 'LICENSE')
        const got = await file.search(pattern)
        const want = [path.join(tempDir, 'LICENSE')]
        expect(got).toStrictEqual(want)
    })

    test('should return files given paths', async () => {
        const path1 = path.join(tempDir, 'LICENSE-APACHE')
        const path2 = path.join(tempDir, 'LICENSE-MIT')
        const pattern = path1 + '\n' + path2
        const got = await file.search(pattern)
        const want = [path.join(tempDir, 'LICENSE-APACHE'), path.join(tempDir, 'LICENSE-MIT')]
        expect(got).toStrictEqual(want)
    })

    test('should return files given glob', async () => {
        const pattern = path.join(tempDir, 'packages/*/LICENSE')
        const got = await file.search(pattern)
        const want = [
            path.join(tempDir, 'packages', 'a', 'LICENSE'),
            path.join(tempDir, 'packages', 'b', 'LICENSE'),
            path.join(tempDir, 'packages', 'c', 'LICENSE'),
        ]
        expect(got).toStrictEqual(want)
    })

    test('should return files given glob', async () => {
        const pattern = path.join(tempDir, 'packages/**/*.js')
        const got = await file.search(pattern)
        const want = [
            path.join(tempDir, 'packages', 'a', 'index.js'),
            path.join(tempDir, 'packages', 'b', 'index.js'),
            path.join(tempDir, 'packages', 'c', 'index.js'),
        ]
        expect(got).toStrictEqual(want)
    })

    test('should exclude directory given path', async () => {
        const pattern = path.join(tempDir, 'packages', 'a')
        const got = await file.search(pattern)
        const want = [path.join(tempDir, 'packages', 'a', 'LICENSE'), path.join(tempDir, 'packages', 'a', 'index.js')]
        expect(got).toStrictEqual(want)
    })
})
