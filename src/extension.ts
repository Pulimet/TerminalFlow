import * as vscode from 'vscode';
import { DataManager } from './DataManager';
import { TerminalFlowProvider } from './TerminalFlowProvider';
import { CommandRunner } from './CommandRunner';

export function activate(context: vscode.ExtensionContext) {
    console.log('Terminal Flow starting...');

    const rootPath = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : '';

    if (!rootPath) {
        console.log('No workspace folder found, Terminal Flow disabled.');
        return;
    }

    const dataManager = new DataManager(rootPath);
    const commandRunner = new CommandRunner(dataManager);

    // Register Webview Provider
    const provider = new TerminalFlowProvider(context.extensionUri, dataManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(TerminalFlowProvider.viewType, provider)
    );

    // Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('terminal-flow.runCommand', (id: string) => {
            commandRunner.runCommand(id);
        }),
        vscode.commands.registerCommand('terminal-flow.runFlow', (id: string) => {
            commandRunner.runFlow(id);
        }),
        vscode.commands.registerCommand('terminal-flow.refresh', () => {
            // Refresh logic is handled by provider listening to events, 
            // but we could force a re-read if needed.
        })
    );

    console.log('Terminal Flow is now active!');
}

export function deactivate() { }
