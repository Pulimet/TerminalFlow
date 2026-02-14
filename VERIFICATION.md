# Verification Steps

Follow these steps to validate that the **Terminal Flow** extension is working correctly.

> **Note**: These steps are specific to the VS Code Extension. If you were looking for validation steps for the "Cross-Platform Data Sharing App" (Web/Android), please check that specific project's repository.

## 1. Environment Setup
- [ ] Ensure **Node.js** (v18+) and **npm** are installed.
- [ ] Open the repository in VS Code.
- [ ] Run `npm install` in the terminal to grab all dependencies.
- [ ] Run `npm run compile` and ensure there are no errors.

## 2. Extension Startup (Web/UI Validation)
- [ ] Press `F5` to launch the **Extension Development Host**.
- [ ] In the new window, open any folder (or create a dummy folder).
- [ ] **Verify**: A `.terminal` folder is automatically created in the root if it didn't exist.
- [ ] **Verify**: The "Terminal Flow" icon appears in the Activity Bar / Sidebar.
- [ ] **Verify**: Clicking the icon loads the React Webview. The UI should look modern and match VS Code's theme.

## 3. Command Validation
- [ ] Click **+ Add Command**.
- [ ] Fill in:
  - **Title**: `Test Echo`
  - **Category**: `Testing`
  - **Command**: `echo "Hello from Terminal Flow"`
- [ ] Click **Save**.
- [ ] **Verify**: The command appears in the list under the "Testing" category.
- [ ] **Verify**: Clicking the **Run (▶️)** button opens a terminal and prints "Hello from Terminal Flow".
- [ ] **Verify**: Open `.terminal/commands.json` in the editor. You should see the new command saved there.

## 4. Flow Validation
- [ ] Click **+ Add Flow**.
- [ ] Fill in:
  - **Title**: `Test Flow`
  - **Category**: `Workflows`
- [ ] Add the `Test Echo` command to the sequence **twice**.
- [ ] Click **Save**.
- [ ] **Verify**: The flow appears in the "Flows" tab.
- [ ] Click **Run (▶️)** on the flow.
- [ ] **Verify**: The terminal runs the sequence (e.g., `echo "..." && echo "..."`).

## 5. Persistence & Sync
- [ ] Close the Extension Development Host window.
- [ ] Relaunch formatting `F5`.
- [ ] **Verify**: Your `Test Echo` and `Test Flow` are still there (Persistence works).
- [ ] **Manual Edit**:
  - Open `.terminal/commands.json`.
  - Change the title of "Test Echo" to "Renamed Echo".
  - Save the file.
- [ ] **Verify**: The Sidebar UI immediately updates to show "Renamed Echo" (Live Sync works).

## 6. Install Locally as a VSIX Package

Use this method to install and test the extension in your regular VS Code (not just the Extension Development Host).

### Prerequisites
- [ ] Install the packaging tool: `npm install -g @vscode/vsce`

### Package the Extension
- [ ] Run `npm run compile` to ensure a clean build.
- [ ] Run `vsce package` from the project root.
- [ ] **Verify**: A file named `terminal-flow-0.0.1.vsix` is created in the project root.

### Install in VS Code
- [ ] Open VS Code.
- [ ] Go to **Extensions** view (`Cmd+Shift+X`).
- [ ] Click the `...` menu (top-right of Extensions panel) → **Install from VSIX...**.
- [ ] Select the generated `.vsix` file.
- [ ] **Verify**: "Terminal Flow" appears in the Extensions list as installed.
- [ ] **Verify**: The Terminal Flow icon appears in the Activity Bar.
- [ ] Repeat steps 2–5 above to validate full functionality in the installed version.

### Uninstall (if needed)
- [ ] Go to **Extensions** → find "Terminal Flow" → click **Uninstall**.

## 7. Publish to the VS Code Marketplace

### One-Time Setup
- [ ] Create an **Azure DevOps** account at [dev.azure.com](https://dev.azure.com).
- [ ] Create a **Personal Access Token (PAT)**:
  1. Go to your Azure DevOps org → User Settings → Personal Access Tokens.
  2. Click **+ New Token**.
  3. Set **Organization** to "All accessible organizations".
  4. Under **Scopes**, select **Marketplace → Manage**.
  5. Copy the generated token.
- [ ] Create a publisher at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
- [ ] Add your publisher name to `package.json`:
  ```json
  "publisher": "your-publisher-name"
  ```

### Login & Publish
- [ ] Run `vsce login <your-publisher-name>` and paste your PAT when prompted.
- [ ] Run `vsce publish` to publish (or `vsce publish minor` to bump the version).
- [ ] **Verify**: Visit `https://marketplace.visualstudio.com/items?itemName=<publisher>.terminal-flow` and confirm your extension is live.

### Publishing
`npm install -g @vscode/vsce`
`vsce login AlexeyKorolev`
vsce publish

### URL's
Extension URL: https://marketplace.visualstudio.com/items?itemName=AlexeyKorolev.terminal-flow
Hub URL: https://marketplace.visualstudio.com/manage/publishers/AlexeyKorolev/extensions/terminal-flow/hub

### Update an Existing Published Extension
- [ ] Bump the version in `package.json` (e.g., `"version": "0.0.2"`).
- [ ] Run `npm run compile`.
- [ ] Run `vsce publish`.
- [ ] **Verify**: The new version appears on the Marketplace within a few minutes.

