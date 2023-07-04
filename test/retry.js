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
            console.log(new Date().toLocaleTimeString(), index, error)

            await new Promise((resolve) => {
                setTimeout(resolve, 1000)
            })
        }
    }
}

module.exports = {
    retry,
}
