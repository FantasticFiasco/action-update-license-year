import os from 'os'
import path from 'path'

import { runnerTemp } from '../github-actions-runner/env.js'

export const dir = () => {
    if (runnerTemp) {
        return runnerTemp
    }
    return os.tmpdir()
}

/**
 * @param {string} fileName
 */
export const file = (fileName) => {
    return path.join(dir(), fileName)
}
