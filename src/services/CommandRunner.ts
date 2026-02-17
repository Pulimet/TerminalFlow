import * as vscode from 'vscode';
import { DataManager } from './DataManager';
import { TerminalService } from './TerminalService';

export class CommandRunner {
    constructor(
        private dataManager: DataManager,
        private terminalService: TerminalService
    ) { }

    public async runCommand(commandId: string) {
        const command = await this.dataManager.getCommand(commandId);
        if (!command) { vscode.window.showErrorMessage(`Command not found: ${commandId}`); return; }

        const config = vscode.workspace.getConfiguration('terminalFlow');
        const shouldPrintTitle = config.get<boolean>('printCommandTitle', true);

        const terminal = command.runInNewTerminal
            ? this.terminalService.createNewTerminal(`Terminal Flow: ${command.title}`)
            : this.terminalService.getTerminal();

        terminal.show();

        if (shouldPrintTitle) {
            terminal.sendText(`echo "Running: ${command.title}"`);
        }
        terminal.sendText(command.command);
    }

    public async resolveCommand(cmdId: string, shouldPrintTitle: boolean): Promise<string | null> {
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
}
