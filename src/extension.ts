import * as vscode from 'vscode';
import { DataManager } from './services/DataManager';
import { TerminalFlowProvider } from './providers/TerminalFlowProvider';
import { CommandRunner } from './services/CommandRunner';

export function activate(context: vscode.ExtensionContext) {
    console.log('Terminal Flow starting...');
    const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

    if (!rootPath) { console.log('No workspace folder found, Terminal Flow disabled.'); return; }

    const dataManager = new DataManager(rootPath);
    const commandRunner = new CommandRunner(dataManager);

    const provider = new TerminalFlowProvider(context.extensionUri, dataManager);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TerminalFlowProvider.viewType, provider));

    context.subscriptions.push(
        vscode.commands.registerCommand('terminal-flow.runCommand', (id: string) => commandRunner.runCommand(id)),
        vscode.commands.registerCommand('terminal-flow.runFlow', (id: string) => commandRunner.runFlow(id)),
        vscode.commands.registerCommand('terminal-flow.refresh', () => { })
    );

    console.log('Terminal Flow is now active!');
}

export function deactivate() { }
