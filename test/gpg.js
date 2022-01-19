const fs = require('fs');
const path = require('path');

const env = require('../src/github-actions-runner/env');
const gpg = require('../src/gpg');

describe('#importPrivateKey should', () => {
    test('return key id', async () => {
        const stderrs = [readTestFile('import-success-1-stderr.txt'), readTestFile('import-success-2-stderr.txt')];

        for (const stderr of stderrs) {
            const got = await gpg.importPrivateKey(cli(stderr), stderr);
            const want = '0123456789ABCDEF';
            expect(got).toStrictEqual(want);
        }
    });

    test('throw error given malformed private key', async () => {
        const stderr = readTestFile('import-failure-malformed.txt');
        const promise = gpg.importPrivateKey(cli(stderr), stderr);
        await expect(promise).rejects.toBeDefined();
    });

    test('throw error given missing file', async () => {
        const stderr = readTestFile('import-failure-missing-file.txt');
        const promise = gpg.importPrivateKey(cli(stderr), stderr);
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#cli.importPrivateKey should', () => {
    test('import private key with passphrase', async () => {
        if (!env.ci) {
            console.log('only run test in ci');
            return;
        }

        const privateKey = readTestFile('private-key-with-passphrase.asc');
        const got = await gpg.cli.importPrivateKey(privateKey);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('import private key without passphrase', async () => {
        if (!env.ci) {
            console.log('only run test in ci');
            return;
        }

        const privateKey = readTestFile('private-key-without-passphrase.asc');
        const got = await gpg.cli.importPrivateKey(privateKey);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('throw error given malformed private key', async () => {
        const privateKey = readTestFile('private-key-malformed.asc');
        const promise = gpg.cli.importPrivateKey(privateKey);
        await expect(promise).rejects.toBeDefined();
    });
});

/**
 * @param {string} fileName
 */
const readTestFile = (fileName) => {
    return fs.readFileSync(path.join(__dirname, `../testdata/gpg/${fileName}`)).toString();
};

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
                });
            });
        },
    };
};
