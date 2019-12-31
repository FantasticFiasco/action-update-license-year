const core = require("@actions/core");
import { GitHub } from "./github"
import { License } from "./license";

// Inputs
const token = core.getInput("token");

// Environment variables
const repositoryFullName = process.env["GITHUB_REPOSITORY"];

async function main() {
    try {
        const repo = parse(repositoryFullName);
        const github = new GitHub(token, repo.owner, repo.name)
        const license = new License();

        await github.createBranch();
        const res = await github.readLicenseFile();
        const currentLicense = Buffer.from(res.data.content, "base64").toString("ascii");
        const updatedLicense = license.update(currentLicense);
        await github.writeLicenseFile(res.data.sha, updatedLicense);
        await github.createPullRequest();
    }
    catch (err) {
        core.setFailed(`Action failed with error: ${err}`);
    }
}

function parse(repositoryFullName) {
    const index = repositoryFullName.indexOf("/");
    const owner = repositoryFullName.substring(0, index);
    const name = repositoryFullName.substring(index + 1, repositoryFullName.length);
    return {
        owner,
        name
    };
}

main();
