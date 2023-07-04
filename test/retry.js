/**
 * @param {() => Promise<void>} action
 */
const retry = async (action) => {
    var retryCount = 10

    for (let index = 0; index < retryCount; index++) {
        try {
            await action()
            return
        } catch (error) {
            console.log(index, error)
        }
    }
}

module.exports = {
    retry,
}
