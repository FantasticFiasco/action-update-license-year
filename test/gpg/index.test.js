const { readPrivateKeyFromDisk, writePrivateKeyToDisk } = require('../../src/gpg');

describe('#readPrivateKeyFromDisk/writePrivateKeyToDisk should', () => {
    test('successfully write to and read from disk', async () => {
        const want = 'private key';
        await writePrivateKeyToDisk(want);
        const got = await readPrivateKeyFromDisk();
        expect(got).toStrictEqual(want);
    });
});

describe('#importPrivateKey should', () => {
    test('successfully import private key with passphrase', () => {
        throw new Error('Not implemented');
    });

    test('successfully import private key without passphrase', () => {
        throw new Error('Not implemented');
    });

    test('throw error given malformed private key', () => {
        throw new Error('Not implemented');
    });
});
