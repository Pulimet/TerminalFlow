# Changelog

All notable changes to this project will be documented in this file.

## [0.0.12] - 2026-02-18

### Added
- **Export/Import**: Added ability to export and import Commands and Flows as JSON files.
    - Support for bulk export/import.
    - Support for exporting individual items.
    - Automatic dependency resolution when exporting Flows (dependent commands are included).
- **Category Autocomplete**: Added autocomplete for category names in the Add Command/Flow forms.    

## [0.0.11] - 2026-02-17

### Added
- **Personal Storage**: Added support for personal commands and flows stored in `~/.terminal`.
- **Storage Toggle**: Added a toggle button in the sidebar to switch between Workspace and Personal storage views.
- **Transfer Capability**: Added "Transfer" button to move commands and flows between Workspace and Personal storage.
- **UI Enhancements**:
    - **Icon Layout**: Improved command/flow item layout by splitting action icons into two rows (Edit/Launch top, Transfer/Delete bottom).
    - **Vertical Centering**: Vertically centered icons for better alignment.
    - **Add Icons**: Updated "Add Command" and "Add Flow" buttons with a proper "+" icon.

## [0.0.10] - 2026-02-17

### Fixed
- **JSON Category Order**: Fixed an issue where deleting a category would corrupt the order of remaining categories.
- **Terminal Execution**: Fixed a bug where all commands in a flow were opening in new terminals, even when not configured to do so.

### Changed
- **Code Improvement**: Refactored `runFlow` and removed duplicate code.

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


## [0.0.3] - [0.0.8] - 2026-02-16

### Fixed
- **Packaging & Validation**: Fixed marketplace validation issues (README badges, LICENSE link, icon) and excluded build/sensitive files from the package.
- **Stability**: Resolved extension activation issues and a chart synchronization loop error.
- **UI Assets**: Fixed webview stylesheet loading in the packaged extension.


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
