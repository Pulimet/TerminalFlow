import * as vscode from 'vscode';
import { DataManager } from './DataManager';
import { TerminalService } from './TerminalService';
import { getEchoCommand, resolveSpecialCommand } from '../utils/commandUtils';
import { delay } from '../utils/common';

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

        if (command.runInNewTerminal) {
            await delay(500);
        }

        terminal.show();

        if (shouldPrintTitle) {
            terminal.sendText(`${getEchoCommand(command.title)} && ${command.command}`);
        } else {
            terminal.sendText(command.command);
        }
    }

    public async resolveCommand(cmdId: string, shouldPrintTitle: boolean): Promise<string | null> {
        const specialCmd = resolveSpecialCommand(cmdId);
        if (specialCmd) return specialCmd;

        const cmd = await this.dataManager.getCommand(cmdId);
        if (cmd) {
            if (shouldPrintTitle) return `${getEchoCommand(cmd.title)} && ${cmd.command}`;
            return cmd.command;
        }
        return null;
    }
}
