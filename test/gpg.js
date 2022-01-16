const fs = require('fs');
const path = require('path');

const env = require('../src/github-actions-runner/env');
const gpg = require('../src/gpg');

describe('#readPrivateKeyFromDisk/writePrivateKeyToDisk should', () => {
    test('successfully write to and read from disk', async () => {
        const want = 'private key';
        await gpg.writePrivateKeyToDisk(want);
        const got = await gpg.readPrivateKeyFromDisk();
        expect(got).toStrictEqual(want);
    });
});

describe('#importPrivateKey should', () => {
    test('return key id', async () => {
        const mocks = [cli('import-success-1-stderr.txt'), cli('import-success-2-stderr.txt')];

        for (const cli of mocks) {
            const got = await gpg.importPrivateKey(cli);
            const want = '0123456789ABCDEF';
            expect(got).toStrictEqual(want);
        }
    });

    test('throw error given malformed private key', async () => {
        const promise = gpg.importPrivateKey(cli('import-failure-malformed.txt'));
        await expect(promise).rejects.toBeDefined();
    });

    test('throw error given missing file', async () => {
        const promise = gpg.importPrivateKey(cli('import-failure-missing-file.txt'));
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#defaultCli.importPrivateKey should', () => {
    test('import private key with passphrase', async () => {
        if (!env.ci) {
            console.log('only run test in ci');
            return;
        }

        const filePath = path.join(__dirname, '../../testdata/gpg/private-key-with-passphrase.asc');
        const got = await gpg.defaultCli.importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('import private key without passphrase', async () => {
        if (!env.ci) {
            console.log('only run test in ci');
            return;
        }

        const filePath = path.join(__dirname, '../../testdata/gpg/private-key-without-passphrase.asc');
        const got = await gpg.defaultCli.importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('throw error given malformed private key', async () => {
        const filePath = path.join(__dirname, '../../testdata/gpg/private-key-malformed.asc');
        const promise = gpg.defaultCli.importPrivateKey(filePath);
        await expect(promise).rejects.toBeDefined();
    });
});

/**
 * @param {string} stderrFileName
 */
const cli = (stderrFileName) => {
    const stderr = fs.readFileSync(path.join(__dirname, `../testdata/gpg/${stderrFileName}`)).toString();

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
