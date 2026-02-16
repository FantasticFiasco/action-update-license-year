import { tmpdir } from 'os'
import { join } from 'path'

import { runnerTemp } from '../github-actions-runner/env.js'

export const dir = () => {
    if (runnerTemp) {
        return runnerTemp
    }
    return tmpdir()
}

/**
 * @param {string} fileName
 */
export const file = (fileName) => {
    return join(dir(), fileName)
}
