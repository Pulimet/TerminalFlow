# Changelog

All notable changes to this project will be documented in this file.

## [0.0.4] - 2026-02-16

### Fixed
- **Publishing**: Fix "extension violation" errors by implementing proper `.vscodeignore` to exclude `node_modules` and other build artifacts.

## [0.0.3] - 2026-02-16

### Fixed
- **Extension Activation**: Resolved issues preventing the extension from activating correctly in some scenarios.
- **Chart Sync Loop**: Fixed "Maximum update depth exceeded" error in chart synchronization.

## [0.0.2] - 2026-02-16

### Added
- **Search Bar**: Added a search bar to commands and flows lists for better navigation.
- **Collapsible Categories**: Organized the command list into collapsible categories.
- **Documentation**: Added comprehensive documentation for the extension's architecture and file structure.
- **Extension Activation Debugging**: Fixes and debugging for extension activation issues.

### Changed
- **UI Refactoring**:
    - Refactored reordering UI, removing individual move buttons and consolidating controls in category headers.
    - Improved icon UI for "Expand All" and "Collapse All" buttons.
    - Standardized icon styling across the extension.
- **Codebase Refactoring**:
    - Enforced a 100-line limit for TypeScript/TSX files for better maintainability.
    - Restructured frontend components into dedicated folders.
    - Implemented asynchronous file I/O in the backend `DataManager`.
- **Delete Functionality**: Fixed bugs in the delete button and added confirmation dialogs.

### Fixed
- **Extension Activation**: Resolved issues preventing the extension from activating correctly in some scenarios.
- **Chart Sync Loop**: Fixed "Maximum update depth exceeded" error in chart synchronization (related to previous work).
