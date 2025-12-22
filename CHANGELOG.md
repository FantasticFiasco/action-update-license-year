# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

## 3.0.4 - 2025-12-22

### :policeman: Security {#3_0_4-security}

- Fixed security vulnerabilities in direct and transient dependencies

## 3.0.3 - 2025-03-02

### :policeman: Security {#3_0_3-security}

- Fixed security vulnerabilities in direct and transient dependencies

## 3.0.2 - 2023-07-05

### :syringe: Fixed {#3_0_2-fixed}

- [#360](https://github.com/FantasticFiasco/action-update-license-year/pull/359) Unable to import GPG private key

## 3.0.1 - 2023-07-05

### :syringe: Fixed {#3_0_1-fixed}

- [#359](https://github.com/FantasticFiasco/action-update-license-year/pull/359) Unable to import GPG private key

### :policeman: Security {#3_0_1-security}

- Security vulnerability in transient dependency `minimatch`

## 3.0.0 - 2023-03-29

### :syringe: Fixed {#3_0_0-fixed}

- [#333](https://github.com/FantasticFiasco/action-update-license-year/issues/333) **BREAKING CHANGE** Update all licenses in a file, not only the first found (discovered by [@glimchb](https://github.com/glimchb)).

    **Migration guide**

    Custom RegExp transforms where previously written to execute with the `mi` flags ("multiline" and "ignore case"). With this new major version the transform also needs to respect the `g` flag ("global"). I.e. please verify that your custom transform behaves as expected when used with the `gmi` flags.

## 2.3.0 - 2023-01-06

### :zap: Added {#2_3_0-added}

- Support for the outputs `currentYear`, `branchName`, `pullRequestNumber` and `pullRequestUrl`. See [`action.yml`](./action.yml) for more information.

## 2.2.2 - 2022-08-23

### :policeman: Security {#2_2_2-security}

- Security vulnerability in transient dependency `@actions/core`

## 2.2.1 - 2022-01-24

### :dizzy: Changed {#2_2_1-changed}

- Migrate into running on Node.js v16

### :policeman: Security {#2_2_1-security}

- Security vulnerability in transient dependency `node-fetch`

## 2.2.0 - 2022-01-20

### :zap: Added {#2_2_0-added}

- [#217](https://github.com/FantasticFiasco/action-update-license-year/issues/217) Support for [GitHub commit signature verification](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification) by means of GPG signing commits

## 2.1.1 - 2021-12-20

### :dizzy: Changed {#2_1_1-changed}

- Update dependency [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core) to v1.6.0
- Update dependency [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github) to v5.0.0
- Update dependency [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob) to v0.2.0

## 2.1.0 - 2021-01-12

### :zap: Added {#2_1_0-added}

- [#119](https://github.com/FantasticFiasco/action-update-license-year/issues/119) Support for specifying commit author name and e-mail (proposed by [@creativecreatorormaybenot](https://github.com/creativecreatorormaybenot))

## 2.0.0 - 2020-12-31

### :zap: Added {#2_0_0-added}

- [#43](https://github.com/FantasticFiasco/action-update-license-year/issues/43) **BREAKING CHANGE** Support for updating one or more arbitrary files. This is a breaking change since [actions/checkout](https://github.com/actions/checkout) now has to precede this action. Please see `README.md` for more information. (proposed by [@spl](https://github.com/spl))

## 1.4.2 - 2020-11-24

### :syringe: Fixed {#1_4_2-fixed}

- [#97](https://github.com/FantasticFiasco/action-update-license-year/pull/97) License file is incorrectly updated using ASCII encoding instead of UTF8 (contributed by [@mondeja](https://github.com/mondeja))

## 1.4.1 - 2020-09-22

### :policeman: Security {#1_4_1-security}

- Security vulnerability in transient dependency `node-fetch`

## 1.4.0 - 2020-08-02

### :zap: Added {#1_4_0-added}

- Support for substituting variable `currentYear` in configuration `commitTitle`, `commitBody`, `prTitle` and `prBody`

## 1.3.2 - 2020-07-28

### :syringe: Fixed {#1_3_2-fixed}

- Variable `currentYear` in branch name is not substituted correctly

## 1.3.1 - 2020-07-28

### :syringe: Fixed {#1_3_1-fixed}

- Action fails when assignees are configured
- Action fails when labels are configured

## 1.3.0 - 2020-07-28

### :zap: Added {#1_3_0-added}

- [#57](https://github.com/FantasticFiasco/action-update-license-year/issues/57) Support for configuring pull request

## 1.2.2 - 2020-07-22

### :syringe: Fixed {#1_2_2-fixed}

- [#59](https://github.com/FantasticFiasco/action-update-license-year/issues/59) Single year in license is updated into a range of years even though year hasn't changed (discovered by [@tenshiAMD](https://github.com/tenshiAMD))

## 1.2.1 - 2020-07-19

### :syringe: Fixed {#1_2_1-fixed}

- GitHub Actions tries to interpolate `${{ secrets.GITHUB_TOKEN }}` in the metadata description

## 1.2.0 - 2020-07-18

### :zap: Added {#1_2_0-added}

- Support for GNU Affero General Public License v3.0 only (AGPL-3.0-only) licenses

### :policeman: Security {#1_2_0-security}

- Security vulnerability in transient dependency `lodash`

## 1.1.3 - 2020-07-14

### :syringe: Fixed {#1_1_3-fixed}

- Update action metadata with required `token` input
- [#42](https://github.com/FantasticFiasco/action-update-license-year/issues/42) Improve error message displayed when license file doesn't exist in repository
- [#40](https://github.com/FantasticFiasco/action-update-license-year/issues/40) Only create pull request if license is updated (discovered by [@spl](https://github.com/spl))

## 1.1.2 - 2020-05-01

### :policeman: Security {#1_1_2-security}

- Security vulnerability in transient dependency `@actions/http-client`

## 1.1.1 - 2020-03-14

### :policeman: Security {#1_1_1-security}

- Security vulnerability in transient dependency `acorn`
- Security vulnerability in transient dependency `minimist`

## 1.1.0 - 2020-01-01

### :zap: Added {#1_1_0-added}

- Support for BSD 2-clause "Simplified" (BSD-2-Clause) licenses
- Support for BSD 3-clause "New" or "Revised" (BSD-3-Clause) licenses
- Support for MIT (MIT) licenses

## 1.0.0 - 2020-01-01

### :zap: Added {#1_0_0-added}

- Support for Apache 2.0 (Apache-2.0) licenses
