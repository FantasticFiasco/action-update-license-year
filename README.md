# GitHub Action - Update copyright years in license file

![Build Status](https://github.com/FantasticFiasco/action-update-license-year/workflows/CI/CD/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/FantasticFiasco/action-update-license-year/badge.svg?branch=master)](https://coveralls.io/github/FantasticFiasco/action-update-license-year?branch=master)
[![SemVer compatible](https://img.shields.io/badge/%E2%9C%85-SemVer%20compatible-blue)](https://semver.org/)
[![dependencies Status](https://david-dm.org/FantasticFiasco/action-update-license-year/status.svg)](https://david-dm.org/FantasticFiasco/action-update-license-year)
[![devDependencies Status](https://david-dm.org/FantasticFiasco/action-update-license-year/dev-status.svg)](https://david-dm.org/FantasticFiasco/action-update-license-year?type=dev)

So this seems to have happened. Instead of manually updating the license copyright years in my GitHub repositories I created this GitHub Action.

> Oh, the loath I have for manual processes...
>
> **- Definitely not a Shakespeare quote**

**Was it a success in terms of productivity?** - I *could* lie to you and say that it was.

**Was it interesting to create?** - Well certainly, it activated the few brains cells I have.

**Can I use it?** - Yes you can. It automatically supports the licenses listed below, but also support custom RegExp transformations where you specify your own license format.

- Apache 2.0 (Apache-2.0)
- BSD 2-clause "Simplified" (BSD-2-Clause)
- BSD 3-clause "New" or "Revised" (BSD-3-Clause)
- GNU Affero General Public License v3.0 only (AGPL-3.0-only)
- MIT (MIT)

## Super simple to use

For the majority of repositories on GitHub the following code will do the job. If you find that the outcome didn't meet your expectations, please refer to [scenarios](#scenarios) or [open a new issue](https://github.com/FantasticFiasco/action-update-license-year/issues/new/choose).

```yaml
- uses: actions/checkout@v2
  with:
    fetch-depth: 0
- uses: FantasticFiasco/action-update-license-year@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

## Usage

<!-- start usage -->
```yaml
- uses: FantasticFiasco/action-update-license-year@v2
  with:
    # Personal access token (PAT) used when interacting with Git and GitHub.
    #
    # We recommend using a service account with the least permissions necessary. Also
    # when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Required: true
    token: ''

    # A path or wildcard pattern specifying files to transform. Multiple paths can be
    # specified using literal styled YAML.
    # Required: false
    # Default: LICENSE
    path: ''

    # A regular expression (JavaScript flavor) describing the license transform. The
    # expression must have the following properties:
    #
    # - A capturing group named "from", encapsulating the first year of license
    #   validity
    # - Written to support the RegExp flags "im" ("ignore case" and
    #   "multiline")
    #
    # The expression will be used by String.prototype.replace() to apply the
    # transformation.
    #
    # Required: false
    # Default: null
    transform: ''

    # The branch name. Supports substituting variable {{currentYear}}.
    # Required: false
    # Default: license/copyright-to-{{currentYear}}
    branchName: ''

    # The git commit title. Supports substituting variable {{currentYear}}.
    # Required: false
    # Default: docs(license): update copyright year(s)
    commitTitle: ''

    # The git commit body that will be appended to commit title, separated by two line
    # returns. Supports substituting variable {{currentYear}}.
    # Required: false
    # Default:
    commitBody: ''

    # The title of the new pull request. Supports substituting variable
    # {{currentYear}}.
    # Required: false
    # Default: Update license copyright year(s)
    prTitle: ''

    # The contents of the pull request. Supports substituting variable
    # {{currentYear}}.
    # Required: false
    # Default:
    prBody: ''

    # Comma-separated list with usernames of people to assign when pull request is
    # created
    # Required: false
    # Default:
    assignees: ''

    # Comma-separated list of labels to add when pull request is created
    # Required: false
    # Default:
    labels: ''
```
<!-- end usage -->

## Scenarios

- [I'm new to GitHub Actions and don't know where to start](#Im-new-to-github-actions-and-dont-know-where-to-start)
- [I want to update my license annually at 03:00 AM on January 1](#i-want-to-update-my-license-annually-at-0300-am-on-january-1)
- [I want to update my license using a manual trigger](#i-want-to-update-my-license-using-a-manual-trigger)
- [I want to update my license, but it isn't called `LICENSE`](#i-want-to-update-my-license-but-it-isnt-called-license)
- [I want to update my license, but it isn't supported by this action](#i-want-to-update-my-license-but-it-isnt-supported-by-this-action)
- [I want to update all my licenses, I have more than one](#i-want-to-update-all-my-licenses-i-have-more-than-one)
- [I want to update all my license in my monorepo](#i-want-to-update-all-my-license-in-my-monorepo)
- [I want to update the license in my source files](#i-want-to-update-the-license-in-my-source-files)
- [I want my pull requests to follow a convention](#i-want-my-pull-requests-to-follow-a-convention)

### I'm new to GitHub Actions and don't know where to start

GitHub Actions is in detail described on the [GitHub Actions documentation](https://docs.github.com/en/actions), but basically it boils down to creating a file in `./.github/workflows/`, e.g. `./.github/workflows/update-copyright-years-in-license-file.yml`, and then decide [when to trigger the action](https://docs.github.com/en/actions/reference/events-that-trigger-workflows), and finally configure it if necessary.

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
    transform: (?<=my own copyright )(?<from>\d{4})-\d{4}
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

Not only do you have a license file in your repository, you also have a header in each and every source file specifying your license. That's a lot of files to update I guess. Well, we've got you covered. Glob patterns to the rescue.

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
