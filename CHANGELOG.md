# Changelog

## [2.0.0] - 2026-04-28

### Major Refactoring: Multi-Profile Architecture

- **Profile Layer**: Moved all user-specific data (CV, profile config, evaluation reports, and generated PDFs) into individual folders under `profiles/`.
- **Global Layer**: Retained `data/applications.md` at the root as a global tracker, updated with a new `Profile` column to distinguish entries between candidates.
- **Profile Template**: Created `profiles/_template/` to allow easy creation of new profiles.
- **System Updates**: `cv-sync-check.mjs`, `merge-tracker.mjs`, and `verify-pipeline.mjs` are now profile-aware.
- **Data Contract**: Updated `CLAUDE.md` to define the Global vs. Profile layer boundaries.

## [1.5.0](https://github.com/santifer/career/compare/v1.4.0...v1.5.0) (2026-04-14)


### Features

* add --min-score flag to batch runner ([#249](https://github.com/santifer/career/issues/249)) ([cb0c7f7](https://github.com/santifer/career/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/santifer/career/issues/287)) ([e71595f](https://github.com/santifer/career/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/santifer/career/issues/246)) ([4b5093a](https://github.com/santifer/career/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))


### Bug Fixes

* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/santifer/career/issues/248)) ([4da772d](https://github.com/santifer/career/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/santifer/career/issues/298)) ([e5e2a6c](https://github.com/santifer/career/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/santifer/career/issues/261)) ([4b834f6](https://github.com/santifer/career/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/santifer/career/issues/286)) ([ecd013c](https://github.com/santifer/career/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))

## [1.4.0](https://github.com/santifer/career/compare/v1.3.0...v1.4.0) (2026-04-13)


### Features

* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/santifer/career/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/santifer/career/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/santifer/career/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/santifer/career/issues/262)) ([d149e54](https://github.com/santifer/career/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/santifer/career/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))


### Bug Fixes

* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/santifer/career/issues/260)) ([2ecf572](https://github.com/santifer/career/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/santifer/career/issues/137)) ([a91e264](https://github.com/santifer/career/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/santifer/career/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/santifer/career/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/santifer/career/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
