const { join } = require('path');
const { importPrivateKey } = require('../../../src/gpg/cli/gpg');

describe('#importPrivateKey should', () => {
    test('import private key with passphrase', async () => {
        if (!process.env.CI) {
            console.log('only run test in ci');
            return;
        }

        const filePath = join(__dirname, '../../testdata/gpg/private-key-with-passphrase.asc');
        const got = await importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('import private key without passphrase', async () => {
        if (!process.env.CI) {
            console.log('only run test in ci');
            return;
        }

        const filePath = join(__dirname, '../../testdata/gpg/private-key-without-passphrase.asc');
        const got = await importPrivateKey(filePath);
        expect(got.stdout).toStrictEqual('');
        expect(got.stderr).toMatch(/secret key imported/);
    });

    test('throw error given malformed private key', async () => {
        const filePath = join(__dirname, '../../testdata/gpg/private-key-malformed.asc');
        const promise = importPrivateKey(filePath);
        await expect(promise).rejects.toBeDefined();
    });
});
