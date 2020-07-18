# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### :zap: Added

- Support for GNU Affero General Public License v3.0 only (AGPL-3.0-only) licenses

### :policeman: Security

- Security vulnerability in transient dependency `lodash`

## [1.1.3] - 2020-07-14

### :syringe: Fixed

- Update action metadata with required `token` input
- [#42](https://github.com/FantasticFiasco/action-update-license-year/issues/42) Improve error message displayed when license file doesn't exist in repository
- [#40](https://github.com/FantasticFiasco/action-update-license-year/issues/40) Only create pull request if license is updated

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
