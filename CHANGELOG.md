# Changelog

All notable changes to this project will be documented in this file.

## [0.0.9] - 2026-02-16

### Added
- **Settings**: Added `terminalFlow.printCommandTitle` setting to toggle printing command titles before execution.
- **Flow Control**: Added ability to start a Flow from a specific step (using the "Arrow Down" icon).
- **Async Execution**: Added "Run in new terminal" option for both Commands and Flows.
    - Commands configured for new terminals will launch in their own dedicated instance.
    - Flows can mix shared and new terminal commands seamlessly.
- **Settings Access**: Added a Settings button to the view title bar for quick access to extension configuration.

### Changed
- **Settings UI**: Refined settings search to filter specifically for extension settings (`@ext:AlexeyKorolev.terminal-flow`).

## [0.0.8] - 2026-02-16

### Fixed
- **UI & Packaging**: Fixed an issue where the webview stylesheet was not loading in the packaged extension because it was referencing an excluded source file. Now correctly points to the bundled CSS.

## [0.0.7] - 2026-02-16

### Security
- **Validation Errors**: Removed sensitive `.local` file from being included in the package by updating `.vscodeignore`.

## [0.0.6] - 2026-02-16

### Fixed
- **Validation Errors**: Removed badges and relative links from `README.md` to pass marketplace validation.

## [0.0.5] - 2026-02-16

### Fixed
- **Validation Errors**: Renamed `LICENSE` to `LICENSE.txt` to fix broken link in README and added extension icon to resolve package warning.

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
