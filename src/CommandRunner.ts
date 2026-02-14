import * as vscode from 'vscode';
import { Command, DataManager, Flow } from './DataManager';

export class CommandRunner {
    private _terminals: Map<string, vscode.Terminal> = new Map();

    constructor(private dataManager: DataManager) { }

    public async runCommand(commandId: string) {
        const command = this.dataManager.getCommand(commandId);
        if (!command) {
            vscode.window.showErrorMessage(`Command not found: ${commandId}`);
            return;
        }

        const terminal = this.getTerminal();
        terminal.show();
        terminal.sendText(command.command);
    }

    public async runFlow(flowId: string) {
        const flow = this.dataManager.getFlow(flowId);
        if (!flow) {
            vscode.window.showErrorMessage(`Flow not found: ${flowId}`);
            return;
        }

        if (!flow.sequence || flow.sequence.length === 0) {
            vscode.window.showWarningMessage(`Flow ${flow.title} is empty.`);
            return;
        }

        const terminal = this.getTerminal();
        terminal.show();

        // Construct a chained command string
        // We use ' && ' to ensure sequential execution dependent on success
        // or ';' if we want to run regardless of success.
        // The prompt says "ensure one command finishes before the next starts". 
        // && is the standard way to do this in shell.

        const commands: string[] = [];
        for (const cmdId of flow.sequence) {
            // Handle built-in sleep command
            if (cmdId.startsWith('__sleep:')) {
                const ms = parseInt(cmdId.replace('__sleep:', ''), 10);
                if (!isNaN(ms) && ms > 0) {
                    const seconds = ms / 1000;
                    commands.push(`echo "Sleeping ${ms}ms..." && sleep ${seconds}`);
                }
                continue;
            }

            // Handle built-in echo command
            if (cmdId.startsWith('__echo:')) {
                const text = cmdId.replace('__echo:', '');
                commands.push(`echo "${text}"`);
                continue;
            }

            const cmd = this.dataManager.getCommand(cmdId);
            if (cmd) {
                commands.push(`echo "Running: ${cmd.title}" && ${cmd.command}`);
            } else {
                vscode.window.showWarningMessage(`Command ${cmdId} in flow not found, skipping.`);
            }
        }

        if (commands.length > 0) {
            const joinedCommand = commands.join(' && ');
            terminal.sendText(joinedCommand);
        }
    }

    private getTerminal(): vscode.Terminal {
        // remove any closed terminals from the map first
        for (const [key, term] of this._terminals) {
            if (term.exitStatus !== undefined) {
                this._terminals.delete(key);
            }
        }

        let terminal = this._terminals.get('main');
        if (!terminal) {
            terminal = vscode.window.createTerminal(`Terminal Flow`);
            this._terminals.set('main', terminal);

            // Handle terminal close to remove from map
            vscode.window.onDidCloseTerminal(t => {
                if (t === terminal) {
                    this._terminals.delete('main');
                }
            });
        }
        return terminal;
    }
}
