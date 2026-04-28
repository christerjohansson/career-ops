# Changelog Entry - 2026-04-28

## [2.0.0] - 2026-04-28

### Major Refactoring: Multi-Profile Architecture

Implemented a new directory structure to support multiple candidate profiles within the same system.

#### Changes:
- **Profile Layer**: Moved all user-specific data (CV, profile config, evaluation reports, and generated PDFs) into individual folders under `profiles/`.
- **Global Layer**: Retained `data/applications.md` at the root as a global tracker, updated with a new `Profile` column to distinguish entries between candidates.
- **Profile Template**: Created `profiles/_template/` to allow easy creation of new profiles.
- **System Updates**:
    - `cv-sync-check.mjs`: Updated to automatically detect and validate all profiles.
    - `merge-tracker.mjs`: Updated to support the new 10-column tracker format and Profile-specific data merging.
    - `verify-pipeline.mjs`: Updated to handle profile-relative paths and the new tracker structure.
    - `_shared.md`: Updated to indicate profile-relative sources of truth.
- **Data Contract**: Updated `CLAUDE.md` to define the Global vs. Profile layer boundaries.

#### Migration:
- Existing files for "Christer Johansson" were migrated to `profiles/christer-johansson/`.
- `applications.md` was updated to include the `christer-johansson` profile identifier for existing entries.
