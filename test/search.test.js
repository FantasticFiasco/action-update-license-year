const { mkdtempSync, rmdirSync, writeFileSync, mkdirSync, openSync, closeSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');
const { search } = require('../src/search');

describe('#search', () => {
    let tempDir = '';

    beforeAll(() => {
        tempDir = mkdtempSync(tmpdir());

        // Create the following file structure:
        //
        //   .
        //   |___LICENSE
        //   |___LICENSE-APACHE
        //   |___LICENSE-MIT
        //   |___LICENSE.md
        //   |___packages
        //     |___a
        //     | |___LICENSE
        //     | |___index.js
        //     |___b
        //     | |___LICENSE
        //     | |___index.js
        //     |___c
        //       |___LICENSE
        //       |___index.js

        // ./
        writeFileSync(join(tempDir, 'LICENSE'), 'TODO');
        writeFileSync(join(tempDir, 'LICENSE-APACHE'), 'TODO');
        writeFileSync(join(tempDir, 'LICENSE-MIT'), 'TODO');
        writeFileSync(join(tempDir, 'LICENSE.md'), 'TODO');

        // ./packages
        mkdirSync(join(tempDir, 'packages'));

        // ./packages/a
        mkdirSync(join(tempDir, 'packages', 'a'));
        writeFileSync(join(tempDir, 'packages', 'a', 'LICENSE'), 'TODO');
        writeFileSync(join(tempDir, 'packages', 'a', 'index.js'), 'TODO');

        // ./packages/b
        mkdirSync(join(tempDir, 'packages', 'b'));
        writeFileSync(join(tempDir, 'packages', 'b', 'LICENSE'), 'TODO');
        writeFileSync(join(tempDir, 'packages', 'b', 'index.js'), 'TODO');

        // ./packages/c
        mkdirSync(join(tempDir, 'packages', 'c'));
        writeFileSync(join(tempDir, 'packages', 'c', 'LICENSE'), 'TODO');
        writeFileSync(join(tempDir, 'packages', 'c', 'index.js'), 'TODO');
    });

    afterAll(() => {
        rmdirSync(tempDir, {
            recursive: true,
        });
    });

    test('should return license file given path', async () => {
        const pattern = join(tempDir, 'LICENSE');
        const actual = await search(pattern);
        const expected = [join(tempDir, 'LICENSE')];
        expect(actual).toStrictEqual(expected);
    });

    test('should return license files given paths', async () => {
        const path1 = join(tempDir, 'LICENSE-APACHE');
        const path2 = join(tempDir, 'LICENSE-MIT');
        const pattern = path1 + '\n' + path2;
        const actual = await search(pattern);
        const expected = [join(tempDir, 'LICENSE-APACHE'), join(tempDir, 'LICENSE-MIT')];
        expect(actual).toStrictEqual(expected);
    });

    test('should return license files given glob', async () => {
        const pattern = join(tempDir, 'packages/*/LICENSE');
        const actual = await search(pattern);
        const expected = [
            join(tempDir, 'packages', 'a', 'LICENSE'),
            join(tempDir, 'packages', 'b', 'LICENSE'),
            join(tempDir, 'packages', 'c', 'LICENSE'),
        ];
        expect(actual).toStrictEqual(expected);
    });

    test('should return source files given glob', async () => {
        const pattern = join(tempDir, 'packages/**/*.js');
        const actual = await search(pattern);
        const expected = [
            join(tempDir, 'packages', 'a', 'index.js'),
            join(tempDir, 'packages', 'b', 'index.js'),
            join(tempDir, 'packages', 'c', 'index.js'),
        ];
        expect(actual).toStrictEqual(expected);
    });

    // TODO: Exclude directories
    // TODO: Error when search finds no file
});
