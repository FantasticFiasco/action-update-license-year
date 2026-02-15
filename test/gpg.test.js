import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import * as gpg from '../src/gpg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('#importPrivateKey should', () => {
    test('return key id', async () => {
        const stderrs = [readTestFile('import-success-1-stderr.txt'), readTestFile('import-success-2-stderr.txt')]

        for (const stderr of stderrs) {
            const got = await gpg.importPrivateKey(cli(stderr), 'GPG_PRIVATE_KEY')
            const want = '0123456789ABCDEF'
            expect(got).toStrictEqual(want)
        }
    })

    test('throw error given malformed private key', async () => {
        const stderr = readTestFile('import-failure-malformed.txt')
        const promise = gpg.importPrivateKey(cli(stderr), 'GPG_PRIVATE_KEY')
        await expect(promise).rejects.toBeDefined()
    })

    test('throw error given missing file', async () => {
        const stderr = readTestFile('import-failure-missing-file.txt')
        const promise = gpg.importPrivateKey(cli(stderr), 'GPG_PRIVATE_KEY')
        await expect(promise).rejects.toBeDefined()
    })
})

describe('#cli.importPrivateKey should', () => {
    test('import private key with passphrase', async () => {
        const privateKey = readTestFile('private-key-with-passphrase.asc')

        const privateKeyName = 'GPG_PRIVATE_KEY'
        process.env[privateKeyName] = privateKey

        const got = await gpg.cli.importPrivateKey(privateKeyName)
        expect(got.stdout).toStrictEqual('')
        expect(got.stderr).toMatch(/secret key imported/)
    })

    test('import private key without passphrase', async () => {
        const privateKey = readTestFile('private-key-without-passphrase.asc')

        const privateKeyName = 'GPG_PRIVATE_KEY'
        process.env[privateKeyName] = privateKey

        const got = await gpg.cli.importPrivateKey(privateKeyName)
        expect(got.stdout).toStrictEqual('')
        expect(got.stderr).toMatch(/secret key imported/)
    })

    test('throw error given malformed private key', async () => {
        const privateKey = readTestFile('private-key-malformed.asc')

        const privateKeyName = 'GPG_PRIVATE_KEY'
        process.env[privateKeyName] = privateKey

        const promise = gpg.cli.importPrivateKey(privateKeyName)
        await expect(promise).rejects.toBeDefined()
    })
})

/**
 * @param {string} fileName
 */
const readTestFile = (fileName) => {
    return fs.readFileSync(path.join(__dirname, `../test/testdata/gpg/${fileName}`)).toString()
}

/**
 * @param {string} stderr
 */
const cli = (stderr) => {
    return {
        importPrivateKey: () => {
            return new Promise((resolve) => {
                resolve({
                    stdout: '',
                    stderr,
                })
            })
        },
    }
}
