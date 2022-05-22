const success = {
    title: () => "# We've got some work to do",
    body: {
        /**
         * @param {number} pr
         */
        single: (pr) =>
            `License was found in 1 file and it had to be updated. Pull request #${pr} contains the changes.`,
        /**
         *
         * @param {number} total
         * @param {number} updated
         * @param {number} pr
         * @returns
         */
        multiple: (total, updated, pr) =>
            `Licenses where found in ${total} files and ${updated} had to be updated. Pull request #${pr} contains the changes.`,
    },
}

const skip = {
    title: () => "# Everything's up to date",
    body: {
        single: () => "License was found in 1 file but it didn't need any update.",
        multiple: () => 'Licenses where found in {0} files but none had to be updated.',
    },
}
