const { run } = require('../src/action-update-license-year');

describe('running action should', () => {
    test("create PR with updated license given branch doesn't exist", async () => {
        // Repository.mock.

        // const octokit = getOctokit('some token');
        // octokit.git.getRef.mockImplementation((params) => {
        //     return params.ref === 'heads/master' ? res.git.getRef.success : res.git.getRef.failure;
        // });
        // octokit.repos.getContent.mockResolvedValue(res.git.getContent.success);
        // updateLicense.mockReturnValue('some updated license');
        // octokit.git.createRef.mockResolvedValue();
        // octokit.pulls.list.mockResolvedValue(res.pulls.list.notEmpty);
        // octokit.pulls.create.mockResolvedValue({});
        await run();
        // expect(octokit.git.createRef).toBeCalledTimes(1);
        // expect(octokit.repos.createOrUpdateFileContents).toBeCalledTimes(1);
        // expect(octokit.pulls.create).toBeCalledTimes(1);
        // expect(setFailed).toBeCalledTimes(0);
    });
});
