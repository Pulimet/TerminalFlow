import * as vscode from 'vscode';
import { DataManager } from './DataManager';

export class CommandRunner {
    private _terminals: Map<string, vscode.Terminal> = new Map();

    constructor(private dataManager: DataManager) { }

    public async runCommand(commandId: string) {
        const command = await this.dataManager.getCommand(commandId);
        if (!command) { vscode.window.showErrorMessage(`Command not found: ${commandId}`); return; }

        const config = vscode.workspace.getConfiguration('terminalFlow');
        const shouldPrintTitle = config.get<boolean>('printCommandTitle', true);

        const terminal = command.runInNewTerminal ? vscode.window.createTerminal(`Terminal Flow: ${command.title}`) : this.getTerminal();
        terminal.show();

        if (shouldPrintTitle) {
            terminal.sendText(`echo "Running: ${command.title}"`);
        }
        terminal.sendText(command.command);
    }

    public async runFlow(flowId: string, fromIndex?: number) {
        const flow = await this.dataManager.getFlow(flowId);
        if (!flow) { vscode.window.showErrorMessage(`Flow not found: ${flowId}`); return; }
        if (!flow.sequence || flow.sequence.length === 0) { vscode.window.showWarningMessage(`Flow ${flow.title} is empty.`); return; }

        const config = vscode.workspace.getConfiguration('terminalFlow');
        const shouldPrintTitle = config.get<boolean>('printCommandTitle', true);
        const sequenceToRun = fromIndex !== undefined ? flow.sequence.slice(fromIndex) : flow.sequence;

        // If the flow itself is set to run in a new terminal, run everything there sequentially
        if (flow.runInNewTerminal) {
            const terminal = vscode.window.createTerminal(`Terminal Flow: ${flow.title}`);
            terminal.show();
            const commands: string[] = [];

            for (const cmdId of sequenceToRun) {
                const cmdStr = await this.resolveCommand(cmdId, shouldPrintTitle);
                if (cmdStr) commands.push(cmdStr);
            }

            if (commands.length > 0) terminal.sendText(commands.join(' && '));
            return;
        }

        // Mixed execution: Group consecutive commands for the shared terminal, launch async ones separately
        const sharedTerminal = this.getTerminal();
        sharedTerminal.show();

        let sharedBuffer: string[] = [];

        for (const cmdId of sequenceToRun) {
            if (cmdId.startsWith('__sleep:') || cmdId.startsWith('__echo:')) {
                const cmdStr = await this.resolveCommand(cmdId, shouldPrintTitle);
                if (cmdStr) sharedBuffer.push(cmdStr);
                continue;
            }

            const command = await this.dataManager.getCommand(cmdId);
            if (!command) {
                vscode.window.showWarningMessage(`Command ${cmdId} in flow not found, skipping.`);
                continue;
            }

            if (command.runInNewTerminal) {
                // Flush shared buffer first
                if (sharedBuffer.length > 0) {
                    sharedTerminal.sendText(sharedBuffer.join(' && '));
                    sharedBuffer = [];
                }

                // execute async command
                const terminal = vscode.window.createTerminal(`Terminal Flow: ${command.title}`);
                terminal.show();
                if (shouldPrintTitle) terminal.sendText(`echo "Running: ${command.title}"`);
                terminal.sendText(command.command);
            } else {
                // Add to shared buffer
                let cmdStr = command.command;
                if (shouldPrintTitle) cmdStr = `echo "Running: ${command.title}" && ${command.command}`;
                sharedBuffer.push(cmdStr);
            }
        }

        // Flush remaining shared buffer
        if (sharedBuffer.length > 0) {
            sharedTerminal.sendText(sharedBuffer.join(' && '));
        }
    }

    private async resolveCommand(cmdId: string, shouldPrintTitle: boolean): Promise<string | null> {
        if (cmdId.startsWith('__sleep:')) {
            const ms = parseInt(cmdId.replace('__sleep:', ''), 10);
            if (!isNaN(ms) && ms > 0) return `echo "Sleeping ${ms}ms..." && sleep ${ms / 1000}`;
            return null;
        }
        if (cmdId.startsWith('__echo:')) {
            return `echo "${cmdId.replace('__echo:', '')}"`;
        }
        const cmd = await this.dataManager.getCommand(cmdId);
        if (cmd) {
            if (shouldPrintTitle) return `echo "Running: ${cmd.title}" && ${cmd.command}`;
            return cmd.command;
        }
        return null;
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
