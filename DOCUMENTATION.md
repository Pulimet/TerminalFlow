# TerminalFlow Project Documentation

## How VS Code Extensions Work

Visual Studio Code extensions are built using Node.js and the VS Code API. They run in a separate process called the **Extension Host**, which ensures that extensions do not block the main VS Code UI.

Key concepts include:
- **Manifest (`package.json`)**: This file is the heart of the extension. It defines metadata (name, version), activation events (when the extension should start), and contribution points (commands, views, keybindings).
- **Activation Event**: Events that trigger the extension to load (e.g., `onStartupFinished`, `onCommand:id`).
- **Entry Point**: The main JavaScript/TypeScript file exported by the extension, where the `activate` function is defined. This function initializes the extension logic.
- **VS Code API**: A set of namespaces (e.g., `vscode.window`, `vscode.commands`) that allow the extension to interact with the editor.
- **Webviews**: Customizable views that run HTML/CSS/JS inside VS Code, communicating with the extension backend via message passing.

In **TerminalFlow**, the extension activates on startup (`onStartupFinished`), initializes a data manager to read configuration, registers commands, and provides a Webview View in the activity bar.

---

## Project Files Overview

| File Path | Description | Type |
|-----------|-------------|------|
| **`src/extension.ts`** | **[ENTRY POINT]** The main entry file where the extension is activated and dependencies are initialized. | Backend |
| `src/providers/TerminalFlowProvider.ts` | Manages the Webview View, handling initialization and message passing between the UI and backend. | Backend |
| `src/services/CommandRunner.ts` | Handles the execution of shell commands and flows in the VS Code integrated terminal. | Backend |
| `src/services/DataManager.ts` | Manages data persistence for Commands and Flows, watching for file changes in `.terminal`. | Backend |
| `src/utils/Store.ts` | A generic file-based storage utility used by DataManager to read/write JSON files. | Backend |
| `src/webview/App.tsx` | The main React component for the Webview UI, managing state and routing. | Frontend |
| `src/webview/index.tsx` | The entry point for the React application, rendering `App` into the DOM. | Frontend |
| `src/webview/types.ts` | TypeScript interfaces defining the shape of `Command`, `Flow`, and component props. | Shared |
| `src/webview/vscode.d.ts` | Type definitions for the `acquireVsCodeApi` function available in the Webview environment. | Frontend |
| `src/webview/hooks/useExtensionData.ts` | A custom React hook that manages communication with the VS Code extension backend. | Frontend |
| `src/webview/components/Command/CommandCategory.tsx` | Renders a collapsible category section containing a list of `CommandItem`s. | Frontend |
| `src/webview/components/Command/CommandForm.tsx` | A form component for creating and editing Commands. | Frontend |
| `src/webview/components/Command/CommandItem.tsx` | Displays a single Command with options to run, edit, or delete it. | Frontend |
| `src/webview/components/Command/CommandList.tsx` | Renders the list of all commands, grouped by category. | Frontend |
| `src/webview/components/Command/CommandList.tsx` | Renders the list of all commands, grouped by category. Includes search and filter logic. | Frontend |
| `src/webview/components/ListActions.tsx` | Reusable toolbar component containing the Search Bar and Expand/Collapse All buttons. | Frontend |
| `src/webview/components/SearchBar.tsx` | A controlled input component for searching through lists. | Frontend |
| `src/webview/components/Flow/FlowCategory.tsx` | Renders a collapsible category section containing a list of `FlowItem`s. | Frontend |
| `src/webview/components/Flow/FlowForm.tsx` | A form component for creating and editing Flows (sequences of commands). | Frontend |
| `src/webview/components/Flow/FlowFormHelpers.tsx` | Helper components for `FlowForm` (e.g., inputs for adding Sleep or Echo steps). | Frontend |
| `src/webview/components/Flow/FlowItem.tsx` | Displays a single Flow with options to run, edit, delete, and view its steps. | Frontend |
| `src/webview/components/Flow/FlowList.tsx` | Renders the list of all flows, grouped by category. | Frontend |
| `src/webview/components/Flow/FlowStep.tsx` | Renders a single step within a Flow (Command, Sleep, or Echo). | Frontend |
| `src/webview/components/Flow/SequenceBuilder.tsx` | A UI component for reordering and removing steps in a Flow. | Frontend |

---

## Detailed File Explanations

### VS Code Configuration

#### `.vscode/launch.json`
This file contains the debugger configuration for the extension.
- **"Run Extension"**: This configuration launches a new VS Code window (Extension Development Host) with the current extension loaded.
    - `preLaunchTask`: Runs the `npm: compile` task before launching to ensure the code is built.
    - `args`: Sets the extension development path to the current workspace.

#### `.vscode/tasks.json`
This file defines tasks that can be run by VS Code.
- **`npm: compile`**: The default build task. It runs the `compile` script from `package.json` (which runs `node esbuild.js`). This ensures the TypeScript code is compiled to JavaScript in the `dist` folder.

### Backend (Extension Process)

#### `src/extension.ts`
This is the **entry point** of the extension.
- **`activate(context)`**:
    - Checks if a workspace folder is open.
    - Initializes `DataManager` for handling data.
    - Initializes `CommandRunner` for executing commands.
    - Registers the `TerminalFlowProvider` for the Webview.
    - Registers VS Code commands: `terminal-flow.runCommand`, `terminal-flow.runFlow`, `terminal-flow.refresh`.
- **`deactivate()`**: Cleanup function (currently empty).

#### `src/providers/TerminalFlowProvider.ts`
Implements `vscode.WebviewViewProvider` to feed the React app into the Sidebar.
- **`resolveWebviewView`**: Sets up the Webview options (enabling scripts) and HTML content.
- **Message Handling**: Listens for messages from the frontend (`runCommand`, `saveCommand`, `deleteFlow`, etc.) and delegates them to `DataManager` or `CommandRunner` via `vscode.commands.executeCommand`.
- **`_getHtmlForWebview`**: Generates the HTML string, injecting the compiled React script (`dist/webview.js`) and CSS.

#### `src/services/CommandRunner.ts`
Responsible for execution logic.
- **`runCommand(id)`**: Fetches command details and sends the command text to the "Terminal Flow" integrated terminal.
- **`runFlow(id)`**: Fetches flow details and executes the sequence of steps.
    - Supports special steps: `__sleep:ms` (pauses execution) and `__echo:text` (prints text).
    - Chains commands using `&&` for sequential execution.
- **`getTerminal()`**: Manages a singleton terminal instance named "Terminal Flow", ensuring it is recreated if closed.

#### `src/services/DataManager.ts`
Central service for data management.
- Uses `Store` to manage `commands.json` and `flows.json` in the `.terminal` directory of the workspace.
- **File Watching**: Watches for changes in `.terminal/*.json` to auto-refresh the data.
- **CRUD Operations**: Methods to `get`, `save`, and `delete` commands and flows.

#### `src/utils/Store.ts`
A generic helper class for reading and writing JSON files.
- Ensures the target directory and file exist.
- Provides `read()` to parse JSON from disk (handling errors gracefully).
- Provides `write(data)` to save data to disk.

### Frontend (React Webview)

#### `src/webview/App.tsx`
The root component of the React application.
- Manages the top-level state: `activeTab` (Commands vs Flows) and `view` (List vs Form).
- Delegates actions (`save`, `delete`, `run`) to the backend via `sendMessage`.
- Renders the appropriate view based on state (e.g., `CommandList`, `FlowForm`).

#### `src/webview/hooks/useExtensionData.ts`
A hook to bridge React state with the VS Code Extension backend.
- **`commands` / `flows` state**: Kept in sync with backend data via `updateData` messages.
- **`sendMessage`**: Wrapper around `vscode.postMessage` to send events to the extension.
- Listens for `message` events from the extension to update local state.

#### `src/webview/components/Command/*`
- **`CommandList.tsx`**: Iterates over commands, grouping them by category using `CommandCategory`. Implementation of `useListLogic` happens here to handle search and reordering.
- **`CommandCategory.tsx`**: A collapsible section implementation. Supports reordering of the category itself via up/down buttons.
- **`CommandItem.tsx`**: The visualization of a single command row. Supports reordering logic.
- **`CommandForm.tsx`**: A form for adding/editing commands. Handles local form state before calling `onSave`.

#### `src/webview/components/Flow/*`
- **`FlowList.tsx`**, **`FlowCategory.tsx`**, **`FlowItem.tsx`**: Analogous to the Command components but for Flows. Supports search and reordering.
- **`FlowForm.tsx`**: Complex form for creating flows.
    - Allows adding existing commands, sleep, or echo steps.
    - Uses `SequenceBuilder` to manage the order of steps.
- **`SequenceBuilder.tsx`**: A list allowing reordering (move up/down) and deletion of steps in a flow.
- **`FlowStep.tsx`**: Renders individual steps inside `FlowItem`'s expanded view or `SequenceBuilder`. Handles the visual distinction between regular commands, sleep, and echo.
