import * as vscode from 'vscode';
import { DataManager } from './DataManager';

export class CommandRunner {
    private _terminals: Map<string, vscode.Terminal> = new Map();

    constructor(private dataManager: DataManager) { }

    public async runCommand(commandId: string) {
        const command = await this.dataManager.getCommand(commandId);
        if (!command) { vscode.window.showErrorMessage(`Command not found: ${commandId}`); return; }
        const terminal = this.getTerminal();
        terminal.show();
        terminal.sendText(command.command);
    }

    public async runFlow(flowId: string) {
        const flow = await this.dataManager.getFlow(flowId);
        if (!flow) { vscode.window.showErrorMessage(`Flow not found: ${flowId}`); return; }
        if (!flow.sequence || flow.sequence.length === 0) { vscode.window.showWarningMessage(`Flow ${flow.title} is empty.`); return; }

        const terminal = this.getTerminal();
        terminal.show();
        const commands: string[] = [];

        for (const cmdId of flow.sequence) {
            if (cmdId.startsWith('__sleep:')) {
                const ms = parseInt(cmdId.replace('__sleep:', ''), 10);
                if (!isNaN(ms) && ms > 0) commands.push(`echo "Sleeping ${ms}ms..." && sleep ${ms / 1000}`);
                continue;
            }
            if (cmdId.startsWith('__echo:')) {
                commands.push(`echo "${cmdId.replace('__echo:', '')}"`);
                continue;
            }
            const cmd = await this.dataManager.getCommand(cmdId);
            if (cmd) commands.push(`echo "Running: ${cmd.title}" && ${cmd.command}`);
            else vscode.window.showWarningMessage(`Command ${cmdId} in flow not found, skipping.`);
        }

        if (commands.length > 0) terminal.sendText(commands.join(' && '));
    }

    private getTerminal(): vscode.Terminal {
        for (const [key, term] of this._terminals) { if (term.exitStatus !== undefined) this._terminals.delete(key); }

        let terminal = this._terminals.get('main');
        if (!terminal) {
            terminal = vscode.window.createTerminal(`Terminal Flow`);
            this._terminals.set('main', terminal);
            vscode.window.onDidCloseTerminal(t => { if (t === terminal) this._terminals.delete('main'); });
        }
        return terminal;
    }
}
