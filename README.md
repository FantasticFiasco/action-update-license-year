# GitHub Action - Update copyright years in license file

![Build Status](https://github.com/FantasticFiasco/action-update-license-year/workflows/CI/CD/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/FantasticFiasco/action-update-license-year/badge.svg?branch=master)](https://coveralls.io/github/FantasticFiasco/action-update-license-year?branch=master)
[![SemVer compatible](https://img.shields.io/badge/%E2%9C%85-SemVer%20compatible-blue)](https://semver.org/)

So this seems to have happened. Instead of manually updating the license copyright years in my GitHub repositories I created this GitHub Action.

> Oh, the loath I have for manual processes...
>
> __- Definitely not a Shakespeare quote__

__Was it a success in terms of productivity?__ - I _could_ lie to you and say that it was.

__Was it interesting to create?__ - Well certainly, it activated the few brains cells I have.

__Can I use it?__ - Yes you can. It automatically supports the licenses listed below, but also support custom RegExp transformations where you specify your own license format.

- Apache 2.0 (Apache-2.0)
- BSD 2-clause "Simplified" (BSD-2-Clause)
- BSD 3-clause "New" or "Revised" (BSD-3-Clause)
- GNU Affero General Public License v3.0 only (AGPL-3.0-only)
- MIT (MIT)

__Will this action commit anything on the default branch?__ - No. The action will create a new pull request, merging it will be your responsibility.

## Super simple to use

For the majority of repositories on GitHub the following workflow file will do the job. If you find that the outcome didn't meet your expectations, please refer to [scenarios](#scenarios) or [open a new issue](https://github.com/FantasticFiasco/action-update-license-year/issues/new/choose).

```yaml
name: Update copyright year(s) in license file

on:
  schedule:
    - cron: "0 3 1 1 *" # 03:00 AM on January 1

jobs:
  update-license-year:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: FantasticFiasco/action-update-license-year@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## API

<!-- start api -->
```yaml
- uses: FantasticFiasco/action-update-license-year@v2
  with:
    # Personal access token (PAT) used when interacting with Git and GitHub.
    #
    # We recommend using a service account with the least permissions necessary. Also
    # when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Required: true
    token: ''

    # A path or wildcard pattern specifying files to transform. Multiple paths can be
    # specified using literal styled YAML.
    #
    # Required: false
    # Default: LICENSE
    path: ''

    # A regular expression (JavaScript flavor) describing the license transform. The
    # expression must have the following properties:
    #
    # - A capturing group named "from", encapsulating the first year of license
    # validity
    # - Written to support the RegExp flags "im" ("ignore case" and "multiline")
    #
    # The expression will be used by String.prototype.replace() to apply the
    # transformation.
    #
    # Required: false
    # Default: null
    transform: ''

    # The branch name. Supports substituting variable {{currentYear}}.
    #
    # Required: false
    # Default: license/copyright-to-{{currentYear}}
    branchName: ''

    # The git commit title. Supports substituting variable {{currentYear}}.
    #
    # Required: false
    # Default: docs(license): update copyright year(s)
    commitTitle: ''

    # The git commit body that will be appended to commit title, separated by two line
    # returns. Supports substituting variable {{currentYear}}.
    #
    # Required: false
    # Default:
    commitBody: ''

    # The git author name, used when committing changes to the repository.
    #
    # Required: false
    # Default: github-actions
    commitAuthorName: ''

    # The git author e-mail, used when committing changes to the repository.
    #
    # Required: false
    # Default: github-actions@github.com
    commitAuthorEmail: ''

    # The GPG private key, used in combination with gpgPassphrase when signing
    # commits. Private keys protected by a passphrase are supported while private keys
    # without a passphrase are unsupported.
    #
    # Required: false
    # Default:
    gpgPrivateKey: ''

    # The GPG passphrase, used in combination with gpgPrivateKey when signing commits.
    #
    # Required: false
    # Default:
    gpgPassphrase: ''

    # The title of the new pull request. Supports substituting variable
    # {{currentYear}}.
    #
    # Required: false
    # Default: Update license copyright year(s)
    prTitle: ''

    # The contents of the pull request. Supports substituting variable
    # {{currentYear}}.
    #
    # Required: false
    # Default:
    prBody: ''

    # Comma-separated list with usernames of people to assign when pull request is
    # created.
    #
    # Required: false
    # Default:
    assignees: ''

    # Comma-separated list of labels to add when pull request is created.
    #
    # Required: false
    # Default:
    labels: ''
```
<!-- end api -->

## Scenarios

The following chapter will showcase some common scenarios and their GitHub Action configuration.

- [I'm new to GitHub Actions and don't know where to start](#Im-new-to-github-actions-and-dont-know-where-to-start)
- [I want to update my license annually at 03:00 AM on January 1](#i-want-to-update-my-license-annually-at-0300-am-on-january-1)
- [I want to update my license using a manual trigger](#i-want-to-update-my-license-using-a-manual-trigger)
- [I want to update my license, but it isn't called `LICENSE`](#i-want-to-update-my-license-but-it-isnt-called-license)
- [I want to update my license, but it isn't supported by this action](#i-want-to-update-my-license-but-it-isnt-supported-by-this-action)
- [I want to update all my licenses, I have more than one](#i-want-to-update-all-my-licenses-i-have-more-than-one)
- [I want to update all my license in my monorepo](#i-want-to-update-all-my-license-in-my-monorepo)
- [I want to update the license in my source files](#i-want-to-update-the-license-in-my-source-files)
- [I want to update my license and a custom source in the same PR](#i-want-to-update-my-license-and-a-custom-source-in-the-same-pr)
- [I want my pull requests to follow a convention](#i-want-my-pull-requests-to-follow-a-convention)
- [I want my pull requests to be automatically merged](#i-want-my-pull-requests-to-be-automatically-merged)

### I'm new to GitHub Actions and don't know where to start

GitHub Actions is in detail described on the [GitHub Actions documentation](https://docs.github.com/actions), but basically it boils down to creating a file in `./.github/workflows/`, e.g. `./.github/workflows/update-copyright-years-in-license-file.yml`, and then decide on [when to trigger the action](https://docs.github.com/actions/reference/events-that-trigger-workflows), and finally configure it if necessary.

The following scenarios will provide you with some examples.

### I want to update my license annually at 03:00 AM on January 1

This would be the most common usage of the action, given that you can put up with receiving a pull request during the new year festivities.

```yaml
name: Update copyright year(s) in license file

on:
  schedule:
    - cron: "0 3 1 1 *"

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: FantasticFiasco/action-update-license-year@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### I want to update my license using a manual trigger

A year is a long time and January 1 might be far off. Now that [GitHub Actions supports manual triggers](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/), we can use `workflow_dispatch` to manually trigger our workflow.

```yaml
name: Update copyright year(s) in license file

on: workflow_dispatch

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: FantasticFiasco/action-update-license-year@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### I want to update my license, but it isn't called `LICENSE`

You have a license in your repository, but perhaps it isn't called `LICENSE`. Maybe it's called `LICENSE.md`? Then you'd have to configure the action accordingly.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      path: LICENSE.md
```

### I want to update my license, but it isn't supported by this action

This action has built in support for a couple of common licenses. However, you might use your own special license, and you've discovered that this action doesn't support it. In this case you can define your own transform.

The transform is declared as a regular expression (JavaScript flavor) and must have the following properties:

- A capturing group named `from`, encapsulating the first year of license validity
- Written to support the RegExp flags `im` (`ignore case` and `multiline`)

The expression will be used by `String.prototype.replace()` to apply the transformation.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      transform: (?<=my own copyright )(?<from>\d{4})?-?(\d{4})?
```

### I want to update all my licenses, I have more than one

Your repository might contain more than one license. Perhaps you have one for open source and one for commercial use? In any case, this action supports specifying multiple paths using literal styled YAML.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      path: |
        LICENSE-OPEN-SOURCE
        LICENSE-COMMERCIAL
```

### I want to update all my licenses in my monorepo

Your repository is perhaps a monorepo and you have a lot of licenses. You would like to update them all at once, preferably without having to specify each and every one. Well, we've got you covered. The `path` input parameter supports glob patterns. Yay!

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      path: packages/*/LICENSE
```

### I want to update the license in my source files

You have a header in each and every source file specifying your license. That's a lot of files to update I guess. Well, we've got you covered. Glob patterns to the rescue.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      path: src/**/*.js
```

### I want to update my license and a custom source in the same PR

Additionally to your license file, your project includes other files which require a custom year updating using `transform`. You can do the full update in one pull request chaining multiples jobs with the `needs` directive.

```yaml
jobs:
  license:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: FantasticFiasco/action-update-license-year@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

  source:
    needs: license
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: FantasticFiasco/action-update-license-year@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          path: "*.js"
          transform: (?<=my own copyright )(?<from>\d{4})?-?(\d{4})?
```

### I want to GPG sign my commits

You might rely on [GitHub commit signature verification](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification) and just love the green sparkling badges. No worries, you can configure this action to use the private key with its corresponding passphrase to sign the commit.

Just remember that the GPG key must be registered to a valid GitHub user, and the e-mail address of that user must be configured as well.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@master
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      commitAuthorEmail: <your github email>
      gpgPrivateKey: ${{ secrets.gpgPrivateKey }}
      gpgPassphrase: ${{ secrets.gpgPassphrase }}
```

### I want my pull requests to follow a convention

Your pull requests might follow some convention. It might require some specific title, or perhaps you wish the pull request to be assigned to a specific maintainer? Whatever the reason, we've got you covered.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      branchName: license/{{currentYear}}
      commitTitle: update my license
      commitBody: Let's keep legal happy.
      prTitle: Update my license
      prBody: It's that time of the year, let's update the license.
      assignees: MyUser, SomeMaintainer
      labels: documentation, legal
```

### I want my pull requests to be automatically merged

Your pull requests can be merged and the branch deleted by utilizing [GitHub CLI](https://github.com/cli/cli).

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: FantasticFiasco/action-update-license-year@v2
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
  - name: Merge pull request
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      # Replace '--merge' with '--rebase' to rebase the commits onto the base
      # branch, or with '--squash' to squash the commits into one commit and merge
      # it into the base branch.
      # For more information regarding the merge command, please see
      # https://cli.github.com/manual/gh_pr_merge.
      gh pr merge --merge --delete-branch
```

## Contributors

The following users have made significant contributions to this project. Thank you so much!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/mondeja"><img src="https://avatars.githubusercontent.com/u/23049315?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Álvaro Mondéjar</b></sub></a><br /><a href="https://github.com/FantasticFiasco/action-update-license-year/commits?author=mondeja" title="Code">💻</a> <a href="https://github.com/FantasticFiasco/action-update-license-year/commits?author=mondeja" title="Documentation">📖</a> <a href="#example-mondeja" title="Examples">💡</a></td>
    <td align="center"><a href="https://gerome.dev/"><img src="https://avatars.githubusercontent.com/u/32737308?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gérôme Grignon</b></sub></a><br /><a href="https://github.com/FantasticFiasco/action-update-license-year/issues?q=author%3Ageromegrignon" title="Bug reports">🐛</a> <a href="https://github.com/FantasticFiasco/action-update-license-year/commits?author=geromegrignon" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/utkarshsethi/"><img src="https://avatars.githubusercontent.com/u/2989912?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Utkarsh Sethi</b></sub></a><br /><a href="https://github.com/FantasticFiasco/action-update-license-year/commits?author=utkarshsethi" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/C0D3-M4513R"><img src="https://avatars.githubusercontent.com/u/28912031?v=4?s=100" width="100px;" alt=""/><br /><sub><b>C0D3 M4513R</b></sub></a><br /><a href="#ideas-C0D3-M4513R" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
