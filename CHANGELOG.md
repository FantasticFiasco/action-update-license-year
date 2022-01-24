# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [2.2.1] - 2022-01-24

### :dizzy: Changed

- Migrate into running on Node.js v16

### :policeman: Security

- Security vulnerability in transient dependency `node-fetch`

## [2.2.0] - 2022-01-20

### :zap: Added

- [#217](https://github.com/FantasticFiasco/action-update-license-year/issues/217) Support for [GitHub commit signature verification](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification) by means of GPG signing commits

## [2.1.1] - 2021-12-20

### :dizzy: Changed

- Update dependency [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core) to v1.6.0
- Update dependency [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github) to v5.0.0
- Update dependency [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob) to v0.2.0

## [2.1.0] - 2021-01-12

### :zap: Added

- [#119](https://github.com/FantasticFiasco/action-update-license-year/issues/119) Support for specifying commit author name and e-mail (proposed by [@creativecreatorormaybenot](https://github.com/creativecreatorormaybenot))

## [2.0.0] - 2020-12-31

### :zap: Added

- [#43](https://github.com/FantasticFiasco/action-update-license-year/issues/43) [BREAKING CHANGE] Support for updating one or more arbitrary files. This is a breaking change since [actions/checkout](https://github.com/actions/checkout) now has to precede this action. Please see `README.md` for more information. (proposed by [@spl](https://github.com/spl))

## [1.4.2] - 2020-11-24

### :syringe: Fixed

- [#97](https://github.com/FantasticFiasco/action-update-license-year/pull/97) License file is incorrectly updated using ASCII encoding instead of UTF8 (contributed by [@mondeja](https://github.com/mondeja))

## [1.4.1] - 2020-09-22

### :policeman: Security

- Security vulnerability in transient dependency `node-fetch`

## [1.4.0] - 2020-08-02

### :zap: Added

- Support for substituting variable `currentYear` in configuration `commitTitle`, `commitBody`, `prTitle` and `prBody`

## [1.3.2] - 2020-07-28

### :syringe: Fixed

- Variable `currentYear` in branch name is not substituted correctly

## [1.3.1] - 2020-07-28

### :syringe: Fixed

- Action fails when assignees are configured
- Action fails when labels are configured

## [1.3.0] - 2020-07-28

### :zap: Added

- [#57](https://github.com/FantasticFiasco/action-update-license-year/issues/57) Support for configuring pull request

## [1.2.2] - 2020-07-22

### :syringe: Fixed

- [#59](https://github.com/FantasticFiasco/action-update-license-year/issues/59) Single year in license is updated into a range of years even though year hasn't changed (discovered by [@tenshiAMD](https://github.com/tenshiAMD))

## [1.2.1] - 2020-07-19

### :syringe: Fixed

- GitHub Actions tries to interpolate `${{ secrets.GITHUB_TOKEN }}` in the metadata description

## [1.2.0] - 2020-07-18

### :zap: Added

- Support for GNU Affero General Public License v3.0 only (AGPL-3.0-only) licenses

### :policeman: Security

- Security vulnerability in transient dependency `lodash`

## [1.1.3] - 2020-07-14

### :syringe: Fixed

- Update action metadata with required `token` input
- [#42](https://github.com/FantasticFiasco/action-update-license-year/issues/42) Improve error message displayed when license file doesn't exist in repository
- [#40](https://github.com/FantasticFiasco/action-update-license-year/issues/40) Only create pull request if license is updated (discovered by [@spl](https://github.com/spl))

## [1.1.2] - 2020-05-01

### :policeman: Security

- Security vulnerability in transient dependency `@actions/http-client`

## [1.1.1] - 2020-03-14

### :policeman: Security

- Security vulnerability in transient dependency `acorn`
- Security vulnerability in transient dependency `minimist`

## [1.1.0] - 2020-01-01

### :zap: Added

- Support for BSD 2-clause "Simplified" (BSD-2-Clause) licenses
- Support for BSD 3-clause "New" or "Revised" (BSD-3-Clause) licenses
- Support for MIT (MIT) licenses

## [1.0.0] - 2020-01-01

### :zap: Added

- Support for Apache 2.0 (Apache-2.0) licenses
