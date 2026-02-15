// @ts-nocheck
import { readFileSync, writeFileSync } from 'fs'
import { EOL } from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { load } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getPackageMajorVersion = () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    const version = packageJson.version
    const match = /(\d+)\.\d+\.\d+/.exec(version)
    if (!match) {
        throw new Error(`Package version '${version}' did not meet expected format`)
    }
    return match[1]
}

const ACTION_NAME = `FantasticFiasco/action-update-license-year@v${getPackageMajorVersion()}`
const METADATA_PATH = path.join(__dirname, '..', 'action.yml')
const README_PATH = path.join(__dirname, '..', 'README.md')
const INPUTS_START_TOKEN = '<!-- start inputs -->'
const INPUTS_END_TOKEN = '<!-- end inputs -->'
const OUTPUTS_START_TOKEN = '<!-- start outputs -->'
const OUTPUTS_END_TOKEN = '<!-- end outputs -->'

const findTokenSpan = (text, startToken, endToken) => {
    // Find the start token
    const startIndex = text.indexOf(startToken)
    if (startIndex < 0) {
        throw new Error(`Start token '${startToken}' not found`)
    }

    // Find the end token
    const endIndex = text.indexOf(endToken)
    if (endIndex < 0) {
        throw new Error(`End token '${endToken}' not found`)
    } else if (endIndex < startIndex) {
        throw new Error('Start token must appear before end token')
    }

    return { startIndex, endIndex }
}

const updateInputs = () => {
    // Load the action.yml
    const yaml = load(readFileSync(METADATA_PATH).toString())

    // Load the README
    const originalReadme = readFileSync(README_PATH).toString()

    const { startIndex, endIndex } = findTokenSpan(originalReadme, INPUTS_START_TOKEN, INPUTS_END_TOKEN)

    // Build the new README
    const newReadme = []

    // Append the beginning
    newReadme.push(originalReadme.slice(0, startIndex + INPUTS_START_TOKEN.length))

    // Build the new inputs section
    newReadme.push('')
    newReadme.push('```yaml')
    newReadme.push(`- uses: ${ACTION_NAME}`)
    newReadme.push('  with:')

    const inputs = yaml.inputs
    let firstInput = true
    for (const key of Object.keys(inputs)) {
        const input = inputs[key]

        // Line break between inputs
        if (!firstInput) {
            newReadme.push('')
        }

        // Constrain the width of the description
        const maxWidth = 80

        let description = input.description.replace(/ +/g, ' ').trim()

        while (description) {
            // Longer than width? Find a space to break apart
            let segment = description
            if (description.length > maxWidth) {
                segment = description.slice(0, maxWidth + 1)
                while (!segment.endsWith(' ') && !segment.endsWith('\n') && segment) {
                    segment = segment.slice(0, segment.length - 1)
                }

                // Trimmed too much?
                if (segment.length < maxWidth * 0.67) {
                    segment = description
                }
            } else {
                segment = description
            }

            // Check for newline
            const newlineIndex = segment.indexOf('\n')
            if (newlineIndex >= 0) {
                segment = segment.slice(0, newlineIndex + 1)
            }

            // Append segment
            newReadme.push(`      # ${segment}`.trimRight())

            // Remaining
            description = description.slice(segment.length)
        }

        // Append blank line
        newReadme.push(`      #`)

        // Required
        if (input.required !== undefined) {
            newReadme.push(`      # Required: ${input.required}`)
        }

        // Default
        if (input.default !== undefined) {
            let defaultLine = '      # Default:'
            if (input.default !== '') {
                defaultLine += ` ${input.default}`
            }
            newReadme.push(defaultLine)
        }

        // Input name
        newReadme.push(`      ${key}: ''`)

        firstInput = false
    }

    newReadme.push('```')
    newReadme.push('')

    // Append the end
    newReadme.push(originalReadme.slice(endIndex))

    // Write the new README
    writeFileSync(README_PATH, newReadme.join(EOL))
}

const updateOutputs = () => {
    // Load the action.yml
    const yaml = load(readFileSync(METADATA_PATH).toString())

    // Load the README
    const originalReadme = readFileSync(README_PATH).toString()

    const { startIndex, endIndex } = findTokenSpan(originalReadme, OUTPUTS_START_TOKEN, OUTPUTS_END_TOKEN)

    // Build the new README
    const newReadme = []

    // Append the beginning
    newReadme.push(originalReadme.slice(0, startIndex + OUTPUTS_START_TOKEN.length))
    newReadme.push('')

    const outputs = yaml.outputs
    for (const key of Object.keys(outputs)) {
        const output = outputs[key]

        newReadme.push(`- \`${key}\`: ${output.description.trim()}`)
    }

    newReadme.push('')

    // Append the end
    newReadme.push(originalReadme.slice(endIndex))

    // Write the new README
    writeFileSync(README_PATH, newReadme.join(EOL))
}

updateInputs()
updateOutputs()
