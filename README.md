# What is Terminal Flow?
Terminal Flow is a VS Code extension that lets you save, organize, and execute shell commands and multi-step workflows without ever leaving your editor. Commands are stored as simple JSON files inside your project, so you can commit them to Git and share them with your entire team.



---

## ✨ Features

### 📂 Project-Based Storage
Commands and flows are stored in `.terminal/commands.json` and `.terminal/flows.json` in your workspace root. Commit them to Git and share with your team.

### ⚡️ One-Click Execution
Run complex shell commands instantly from the sidebar — no need to remember or retype them.

### 🔗 Command Flows
Chain multiple commands together into reproducible workflows (e.g., *Build → Test → Deploy*). Commands execute sequentially, each waiting for the previous to succeed.

### ⏱ Built-in Sleep & Echo
Insert **sleep** (with configurable delay) and **echo** (with custom messages) steps directly into flows — no need to create separate commands for them.

### ⚡️ Async Execution
Configure individual commands or entire flows to run in their own dedicated terminal windows, allowing parallel execution alongside your main work.

### ⏯ Flexible Flows
Start your flows from any step in the sequence using the "Run from here" (⬇) button.

### 🎨 Modern UI
Clean, React-based sidebar interface that blends seamlessly with your VS Code theme. Categories are collapsible and remember their state.

### 🔍 Smart Search
Instantly filter your commands and flows. Search works across titles, descriptions, and even the command code itself.

### ↕️ Easy Organization
Keep your workspace tidy by reordering both categories and individual commands using the up/down controls.

### 🔄 Live Sync
Edit the JSON files directly or use the UI — both stay in sync instantly via file watchers.

---

## 📦 Installation

### From VS Code Marketplace

**[Install Terminal Flow →](https://marketplace.visualstudio.com/items?itemName=AlexeyKorolev.terminal-flow)**

Or manually:
1. Open VS Code.
2. Go to **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for **"Terminal Flow"**.
4. Click **Install**.

---

## 🚀 Usage

1. Open the **Terminal Flow** icon in the Activity Bar (terminal icon in the sidebar).

### Commands Tab
- Click **+ Add Command** to create a new shell command.
- Enter a **Title**, **Description**, **Category**, and the **Command**.
- Click ▶ to run it in the integrated terminal.
- Commands are grouped by category with collapsible sections.
- Use the **Search Bar** at the top to filter commands.
- Use the **▲ ▼** buttons to reorder commands and categories.

### Flows Tab
- Click **+ Add Flow** to create a workflow sequence.
- Pick from your existing commands, or add built-in **Sleep** and **Echo** steps.
- Reorder steps with ↑↓ arrows.
- Click ▶ on a flow to run the entire sequence, or expand it and ▶ individual steps.

---

## 📁 File Structure

Terminal Flow stores everything in a `.terminal` folder at your workspace root:

```
.terminal/
├── commands.json          # Your saved commands
├── flows.json             # Your saved workflows
├── commandCategories.json # Order of command categories
└── flowCategories.json    # Order of flow categories
```

> **Tip**: Commit this folder to Git so your team shares the same commands and workflows.

---

## 🛠 Development

### Prerequisites
- Node.js 18+
- VS Code 1.80+

### Setup
```bash
git clone https://github.com/AlexeyKorolev/TerminalFlow.git
cd TerminalFlow
npm install
```

### Build
```bash
npm run compile
```

### Watch Mode
```bash
npm run watch
```

### Debug
Press `F5` in VS Code to launch the Extension Development Host.

---

## 📄 License

MIT © Alexey Korolev
