/**
 * @param {string} key
 */
export const getEnvironmentVariable = (key) => {
    const value = process.env[key];
    if (typeof value === 'undefined') {
        throw new Error(`Environment variable required and not supplied: ${key}`);
    }
    return value;
};

/**
 * @param {string} repoPath The owner and repository name. For example, 'octocat/Hello-World'.
 */
export const parseRepoPath = (repoPath) => {
    const match = /([\w-]+)\/([\w-]+)/.exec(repoPath);
    if (!match || !match[1] || !match[2]) {
        throw new Error(`GitHub repository path ${repoPath} is invalid`);
    }

    return {
        owner: match[1],
        name: match[2],
    };
};
