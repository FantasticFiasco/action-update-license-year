import { create } from '@actions/glob'
import fs from 'fs'

/**
 * @param {string} pattern
 */
export const search = async (pattern) => {
    const globber = await create(pattern)
    const paths = await globber.glob()
    const files = paths.filter((path) => {
        return fs.statSync(path).isFile()
    })

    return files
}
