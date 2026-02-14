# Terminal Flow

**Terminal Flow** is a Visual Studio Code extension that helps you manage, organize, and execute shell commands and sequences ("flows") directly from your editor. It treats your project's `.terminal` folder as a single source of truth, allowing you to share command configurations with your team via Git.

## Features

- **📂 Project-Based Storage**: Commands and flows are stored in `.terminal/commands.json` and `.terminal/flows.json` in your workspace root.
- **⚡️ One-Click Execution**: run complex shell commands instantly from the sidebar.
- **🔗 Command Flows**: Chain multiple commands together to create reproducible workflows (e.g., "Build" -> "Test" -> "Deploy").
- **🎨 Modern UI**: Clean, React-based sidebar interface that integrates seamlessly with VS Code.
- **🔄 Live Sync**: modifying the JSON files manually updates the UI instantly, and vice versa.

## Installation

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Press `F5` to open a new VS Code window with the extension loaded.

## Usage

1. Open the **Terminal Flow** view in the Activity Bar (terminal icon).
2. **Commands Tab**:
   - Click **+ Add Command** to create a new shell command.
   - Enter a Title, Description, Category, and the Command itself.
   - Click ▶️ to run it in the integrated terminal.
3. **Flows Tab**:
   - Click **+ Add Flow** to create a sequence.
   - Select existing commands to add to the sequence.
   - Reorder them as needed.
   - Running a flow executes commands strictly sequentially (waiting for success before proceeding).

## Development

### Build
```bash
npm run compile
```

### Watch Mode
```bash
npm run watch
```

### File Structure
- `src/extension.ts`: Main entry point.
- `src/DataManager.ts`: Handles file I/O and watching.
- `src/CommandRunner.ts`: Manages VS Code terminals.
- `src/webview/`: React application for the sidebar UI.
