// @ts-nocheck
const { readFileSync, writeFileSync } = require('fs');
const { EOL } = require('os');
const { join } = require('path');
const { load } = require('js-yaml');

const getPackageMajorVersion = () => {
    const version = require(join(__dirname, '..', 'package.json')).version;
    const match = /(\d+)\.\d+\.\d+/.exec(version);
    if (!match) {
        throw new Error(`Package version '${version}' did not meet expected format`);
    }
    return match[1];
};

const updateUsage = () => {
    // Load the action.yml
    const actionYaml = load(readFileSync(METADATA_PATH).toString());

    // Load the README
    const originalReadme = readFileSync(README_PATH).toString();

    // Find the start token
    const startTokenIndex = originalReadme.indexOf(USAGE_START_TOKEN);
    if (startTokenIndex < 0) {
        throw new Error(`Start token '${USAGE_START_TOKEN}' not found`);
    }

    // Find the end token
    const endTokenIndex = originalReadme.indexOf(USAGE_END_TOKEN);
    if (endTokenIndex < 0) {
        throw new Error(`End token '${USAGE_END_TOKEN}' not found`);
    } else if (endTokenIndex < startTokenIndex) {
        throw new Error('Start token must appear before end token');
    }

    // Build the new README
    const newReadme = [];

    // Append the beginning
    newReadme.push(originalReadme.substr(0, startTokenIndex + USAGE_START_TOKEN.length));

    // Build the new usage section
    newReadme.push('```yaml');
    newReadme.push(`- uses: ${ACTION_NAME}`);
    newReadme.push('  with:');

    const inputs = actionYaml.inputs;
    let firstInput = true;
    for (const key of Object.keys(inputs)) {
        const input = inputs[key];

        // Line break between inputs
        if (!firstInput) {
            newReadme.push('');
        }

        // Constrain the width of the description
        const maxWidth = 80;

        let description = input.description.replace(/ +/g, ' ').trim();

        while (description) {
            // Longer than width? Find a space to break apart
            let segment = description;
            if (description.length > maxWidth) {
                segment = description.substr(0, maxWidth + 1);
                while (!segment.endsWith(' ') && !segment.endsWith('\n') && segment) {
                    segment = segment.substr(0, segment.length - 1);
                }

                // Trimmed too much?
                if (segment.length < maxWidth * 0.67) {
                    segment = description;
                }
            } else {
                segment = description;
            }

            // Check for newline
            const newlineIndex = segment.indexOf('\n');
            if (newlineIndex >= 0) {
                segment = segment.substr(0, newlineIndex + 1);
            }

            // Append segment
            newReadme.push(`    # ${segment}`.trimRight());

            // Remaining
            description = description.substr(segment.length);
        }

        // Append blank line
        newReadme.push(`    #`);

        // Required
        if (input.required !== undefined) {
            newReadme.push(`    # Required: ${input.required}`);
        }

        // Default
        if (input.default !== undefined) {
            let defaultLine = '    # Default:';
            if (input.default !== '') {
                defaultLine += ` ${input.default}`;
            }
            newReadme.push(defaultLine);
        }

        // Input name
        newReadme.push(`    ${key}: ''`);

        firstInput = false;
    }

    newReadme.push('```');

    // Append the end
    newReadme.push(originalReadme.substr(endTokenIndex));

    // Write the new README
    writeFileSync(README_PATH, newReadme.join(EOL));
};

const ACTION_NAME = `FantasticFiasco/action-update-license-year@v${getPackageMajorVersion()}`;
const METADATA_PATH = join(__dirname, '..', 'action.yml');
const README_PATH = join(__dirname, '..', 'README.md');
const USAGE_START_TOKEN = '<!-- start usage -->';
const USAGE_END_TOKEN = '<!-- end usage -->';

updateUsage();
