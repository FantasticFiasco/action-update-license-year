/**
 * @param {() => Promise<void>} action
 */
const retry = async (action) => {
    for (let index = 0; index < 10; index++) {
        try {
            await action()
            return
        } catch (error) {
            await sleep(1000)
        }
    }
}

/**
 * @param {number} ms
 */
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
    retry,
}
