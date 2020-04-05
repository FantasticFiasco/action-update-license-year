# GitHub Action - Update copyright years in license file

[![Build Status](https://travis-ci.org/FantasticFiasco/action-update-license-year.svg?branch=master)](https://travis-ci.org/FantasticFiasco/action-update-license-year)
[![Coverage Status](https://coveralls.io/repos/github/FantasticFiasco/action-update-license-year/badge.svg?branch=master)](https://coveralls.io/github/FantasticFiasco/action-update-license-year?branch=master)
[![SemVer compatible](https://img.shields.io/badge/%E2%9C%85-SemVer%20compatible-blue)](https://semver.org/)
[![dependencies Status](https://david-dm.org/FantasticFiasco/action-update-license-year/status.svg)](https://david-dm.org/FantasticFiasco/action-update-license-year)
[![devDependencies Status](https://david-dm.org/FantasticFiasco/action-update-license-year/dev-status.svg)](https://david-dm.org/FantasticFiasco/action-update-license-year?type=dev)

So this seems to have happened. Instead of manually updating the license copyright years in my GitHub repositories I created this GitHub Action.

> Oh, the loath I have for manual processes...
>
> **- Definitely not a Shakespeare quote**

**Was is a success in terms of productivity?** - I *could* lie to you and say that it was.

**Was it interesting to create?** - Well certainly, it activated the few brains cells I have.

**Can I use it?** - You can if your repository has any of the following licenses:

- Apache 2.0
- BSD 2-clause "Simplified"
- BSD 3-clause "New" or "Revised"
- MIT

If you find that the license you have is incompatible with this GitHub Action, please don't hesitate to create a new issue.

## Example usage

Create a workflow file in path `./.github/workflows/update-copyright-years-in-license-file.yml` with a scheduled trigger that starts the workflow at 03:00 AM every January 1.

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
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

```
