import json from '@eslint/json'
import markdown from '@eslint/markdown'
import prettier from 'eslint-plugin-prettier/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    /**
     * Global ignores
     */
    globalIgnores(['dist/']),

    /**
     * JavaScript
     */
    {
        name: 'JavaScript files',
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    },

    /**
     * JSON
     */
    {
        name: 'JSON files',
        files: ['**/*.json'],
        ignores: ['.vscode/*.json', 'package-lock.json'],
        plugins: {
            json,
        },
        extends: [json.configs.recommended],
        language: 'json/json',
    },
    {
        name: 'JSONC files',
        files: ['**/*.jsonc', '.vscode/*.json', 'tsconfig.json'],
        plugins: {
            json,
        },
        extends: [json.configs.recommended],
        language: 'json/jsonc',
    },

    /**
     * Markdown
     */
    {
        name: 'Markdown files',
        files: ['**/*.md'],
        plugins: {
            markdown,
        },
        extends: [markdown.configs.recommended],
        language: 'markdown/gfm',
        languageOptions: {
            frontmatter: 'yaml',
        },
        rules: {
            'markdown/no-bare-urls': 'error',
            'markdown/no-duplicate-headings': 'error',
        },
    },

    /**
     * Prettier, keep this last to ensure it is applied after all configurations.
     */
    prettier,
])
