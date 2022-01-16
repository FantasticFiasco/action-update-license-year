const processes = require('../../src/os/processes');

describe('#exec should', () => {
    test('successfully run command and write to stdout', async () => {
        const got = await processes.exec('echo "This is a test"');
        const want = {
            stdout: 'This is a test',
            stderr: '',
        };
        expect(got).toStrictEqual(want);
    });

    test('successfully run command and write to stderr', async () => {
        const got = await processes.exec('echo "This is a test" 1>&2');
        const want = {
            stdout: '',
            stderr: 'This is a test',
        };
        expect(got).toStrictEqual(want);
    });

    test('throw error given unknown command', async () => {
        const promise = processes.exec('xyz');
        await expect(promise).rejects.toBeDefined();
    });
});
