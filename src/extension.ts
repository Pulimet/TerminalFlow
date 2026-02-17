import * as vscode from 'vscode';
import { DataManager } from './services/DataManager';
import { TerminalFlowProvider } from './providers/TerminalFlowProvider';
import { CommandRunner } from './services/CommandRunner';
import { TerminalService } from './services/TerminalService';
import { FlowRunner } from './services/FlowRunner';

export function activate(context: vscode.ExtensionContext) {
    console.log('Terminal Flow starting...');
    const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

    if (!rootPath) { console.log('No workspace folder found, Terminal Flow disabled.'); return; }

    const dataManager = new DataManager(rootPath);
    const terminalService = new TerminalService();
    const commandRunner = new CommandRunner(dataManager, terminalService);
    const flowRunner = new FlowRunner(dataManager, terminalService, commandRunner);

    const provider = new TerminalFlowProvider(context, dataManager);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TerminalFlowProvider.viewType, provider));

    context.subscriptions.push(
        vscode.commands.registerCommand('terminal-flow.runCommand', (id: string) => commandRunner.runCommand(id)),
        vscode.commands.registerCommand('terminal-flow.runFlow', (id: string, fromIndex?: number) => flowRunner.runFlow(id, fromIndex)),
        vscode.commands.registerCommand('terminal-flow.openSettings', () => vscode.commands.executeCommand('workbench.action.openSettings', '@ext:AlexeyKorolev.terminal-flow'))
    );

    context.subscriptions.push(vscode.Disposable.from({ dispose: () => terminalService.dispose() }));

    console.log('Terminal Flow is now active!');
}

export function deactivate() { }
