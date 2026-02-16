/**
 * @param {() => Promise<void>} action
 */
export const retry = async (action) => {
    var times = 10
    var error

    for (let i = 0; i < times; i++) {
        try {
            await action()
            return
        } catch (e) {
            error = e
            await sleep(1000)
        }
    }

    throw error
}

/**
 * @param {number} ms
 */
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
