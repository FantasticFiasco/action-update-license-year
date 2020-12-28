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

**Can I use it?** - You can if your repository has any of the following licenses:

- Apache 2.0 (Apache-2.0)
- BSD 2-clause "Simplified" (BSD-2-Clause)
- BSD 3-clause "New" or "Revised" (BSD-3-Clause)
- GNU Affero General Public License v3.0 only (AGPL-3.0-only)
- MIT (MIT)

If you find that the license you use is incompatible with this GitHub Action, please don't hesitate to create a [new issue](https://github.com/FantasticFiasco/action-update-license-year/issues/new/choose).

## Super simple to use

For the majority of repositories on GitHub the following code will do the job. If you find that the outcome didn't meet your expectations, please refer to [scenarios](#scenarios) or [open a new issue](https://github.com/FantasticFiasco/action-update-license-year/issues/new/choose).

```yaml
- uses: FantasticFiasco/action-update-license-year@v1
```

## Usage

<!-- start usage -->
```yaml
- uses: FantasticFiasco/action-update-license-year@v1
  with:
    # Personal access token (PAT) used to fetch the repository. The PAT is configured
    # with the local git config, which enables your scripts to run authenticated git
    # commands. The post-job step removes the PAT.
    #
    # We recommend using a service account with the least permissions necessary. Also
    # when generating a new PAT, select the least scopes necessary.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Required: false
    # Default: ${{ github.token }}
    token: ''

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
      - uses: FantasticFiasco/action-update-license-year@v1
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
      - uses: FantasticFiasco/action-update-license-year@v1
```

### I want my pull requests to follow a convention

Your pull requests might follow some convention. It might require some specific title, or perhaps you wish the pull request to be assigned to a specific maintainer? Whatever the reason, we've got you covered.

```yaml
steps:
  - uses: FantasticFiasco/action-update-license-year@v1
    with:
      branchName: license/{{currentYear}}
      commitTitle: update my license
      commitBody: Let's keep legal happy.
      prTitle: Update my license
      prBody: It's that time of the year, let's update the license.
      assignees: MyUser, SomeMaintainer
      labels: documentation, legal
```
# Test repo
# Test repo
# Test repo
# Test repo
# Test repo
# Test repo
