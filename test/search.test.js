const { mkdtempSync, rmdirSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');
const { search } = require('../src/search');

describe('#search', () => {
    let tempDir = '';

    beforeAll(() => {
        tempDir = mkdtempSync(join(tmpdir(), 'search-'));

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
        writeFileSync(join(tempDir, 'LICENSE'), 'some content');
        writeFileSync(join(tempDir, 'LICENSE-APACHE'), 'some content');
        writeFileSync(join(tempDir, 'LICENSE-MIT'), 'some content');
        writeFileSync(join(tempDir, 'LICENSE.md'), 'some content');

        // ./packages
        mkdirSync(join(tempDir, 'packages'));

        // ./packages/a
        mkdirSync(join(tempDir, 'packages', 'a'));
        writeFileSync(join(tempDir, 'packages', 'a', 'LICENSE'), 'some content');
        writeFileSync(join(tempDir, 'packages', 'a', 'index.js'), 'some content');

        // ./packages/b
        mkdirSync(join(tempDir, 'packages', 'b'));
        writeFileSync(join(tempDir, 'packages', 'b', 'LICENSE'), 'some content');
        writeFileSync(join(tempDir, 'packages', 'b', 'index.js'), 'some content');

        // ./packages/c
        mkdirSync(join(tempDir, 'packages', 'c'));
        writeFileSync(join(tempDir, 'packages', 'c', 'LICENSE'), 'some content');
        writeFileSync(join(tempDir, 'packages', 'c', 'index.js'), 'some content');
    });

    afterAll(() => {
        rmdirSync(tempDir, {
            recursive: true,
        });
    });

    test('should return file given path', async () => {
        const pattern = join(tempDir, 'LICENSE');
        const got = await search(pattern);
        const want = [join(tempDir, 'LICENSE')];
        expect(got).toStrictEqual(want);
    });

    test('should return files given paths', async () => {
        const path1 = join(tempDir, 'LICENSE-APACHE');
        const path2 = join(tempDir, 'LICENSE-MIT');
        const pattern = path1 + '\n' + path2;
        const got = await search(pattern);
        const want = [join(tempDir, 'LICENSE-APACHE'), join(tempDir, 'LICENSE-MIT')];
        expect(got).toStrictEqual(want);
    });

    test('should return files given glob', async () => {
        const pattern = join(tempDir, 'packages/*/LICENSE');
        const got = await search(pattern);
        const want = [
            join(tempDir, 'packages', 'a', 'LICENSE'),
            join(tempDir, 'packages', 'b', 'LICENSE'),
            join(tempDir, 'packages', 'c', 'LICENSE'),
        ];
        expect(got).toStrictEqual(want);
    });

    test('should return files given glob', async () => {
        const pattern = join(tempDir, 'packages/**/*.js');
        const got = await search(pattern);
        const want = [
            join(tempDir, 'packages', 'a', 'index.js'),
            join(tempDir, 'packages', 'b', 'index.js'),
            join(tempDir, 'packages', 'c', 'index.js'),
        ];
        expect(got).toStrictEqual(want);
    });

    test('should exclude directory given path', async () => {
        const pattern = join(tempDir, 'packages', 'a');
        const got = await search(pattern);
        const want = [join(tempDir, 'packages', 'a', 'LICENSE'), join(tempDir, 'packages', 'a', 'index.js')];
        expect(got).toStrictEqual(want);
    });
});
