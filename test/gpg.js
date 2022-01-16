const { readFileSync } = require('fs');
const { join } = require('path');

const { ci } = require('../src/github-actions-runner/env');
const { defaultCli, importPrivateKey, readPrivateKeyFromDisk, writePrivateKeyToDisk } = require('../src/gpg');

describe('#readPrivateKeyFromDisk/writePrivateKeyToDisk should', () => {
    test('successfully write to and read from disk', async () => {
        const want = 'private key';
        await writePrivateKeyToDisk(want);
        const got = await readPrivateKeyFromDisk();
        expect(got).toStrictEqual(want);
    });
});

describe('#importPrivateKey should', () => {
    test('return key id', async () => {
        const mocks = [cli('import-success-1-stderr.txt'), cli('import-success-2-stderr.txt')];

        for (const cli of mocks) {
            const got = await importPrivateKey(cli);
            const want = '0123456789ABCDEF';
            expect(got).toStrictEqual(want);
        }
    });

    test('throw error given malformed private key', async () => {
        const promise = importPrivateKey(cli('import-failure-malformed.txt'));
        await expect(promise).rejects.toBeDefined();
    });

    test('throw error given missing file', async () => {
        const promise = importPrivateKey(cli('import-failure-missing-file.txt'));
        await expect(promise).rejects.toBeDefined();
    });
});

describe('#defaultCli.importPrivateKey should', () => {
    test('import private key with passphrase', async () => {
        if (!ci) {
            console.log('only run test in ci');
            return;
        }

        const filePath = join(__dirname, '../../testdata/gpg/private-key-with-passphrase.asc');
        const got = await defaultCli.importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('import private key without passphrase', async () => {
        if (!ci) {
            console.log('only run test in ci');
            return;
        }

        const filePath = join(__dirname, '../../testdata/gpg/private-key-without-passphrase.asc');
        const got = await defaultCli.importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('throw error given malformed private key', async () => {
        const filePath = join(__dirname, '../../testdata/gpg/private-key-malformed.asc');
        const promise = defaultCli.importPrivateKey(filePath);
        await expect(promise).rejects.toBeDefined();
    });
});

/**
 * @param {string} stderrFileName
 */
const cli = (stderrFileName) => {
    const stderr = readFileSync(join(__dirname, `../testdata/gpg/${stderrFileName}`)).toString();

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
