import * as vscode from 'vscode';
import { DataManager } from './DataManager';
import { CommandRunner } from './CommandRunner';
import { TerminalService } from './TerminalService';
import { getEchoCommand, resolveSpecialCommand } from '../utils/commandUtils';
import { delay, NEW_TERMINAL_DELAY } from '../utils/common';

export class FlowRunner {
    constructor(
        private dataManager: DataManager,
        private terminalService: TerminalService,
        private commandRunner: CommandRunner
    ) { }

    public async runFlow(flowId: string, fromIndex?: number) {
        const flow = await this.dataManager.getFlow(flowId);
        if (!flow) { vscode.window.showErrorMessage(`Flow not found: ${flowId}`); return; }
        if (!flow.sequence || flow.sequence.length === 0) { vscode.window.showWarningMessage(`Flow ${flow.title} is empty.`); return; }

        const config = vscode.workspace.getConfiguration('terminalFlow');
        const shouldPrintTitle = config.get<boolean>('printCommandTitle', true);
        const sequenceToRun = fromIndex !== undefined ? flow.sequence.slice(fromIndex) : flow.sequence;

        let baseTerminal: vscode.Terminal;
        let isNew = false;

        if (flow.runInNewTerminal) {
            baseTerminal = this.terminalService.createNewTerminal(`Terminal Flow: ${flow.title}`);
            isNew = true;
        } else {
            const result = this.terminalService.getTerminal();
            baseTerminal = result.terminal;
            isNew = result.isNew;
        }

        baseTerminal.show();
        if (isNew) await delay(NEW_TERMINAL_DELAY);

        await this.runSequence(sequenceToRun, shouldPrintTitle, baseTerminal);
    }

    private async runSequence(sequence: string[], shouldPrintTitle: boolean, baseTerminal: vscode.Terminal) {
        let sharedBuffer: string[] = [];

        for (const cmdId of sequence) {
            const specialCmd = resolveSpecialCommand(cmdId);
            if (specialCmd) {
                const cmdStr = await this.commandRunner.resolveCommand(cmdId, shouldPrintTitle);
                if (cmdStr) sharedBuffer.push(cmdStr);
                continue;
            }

            const command = await this.dataManager.getCommand(cmdId);
            if (!command) {
                vscode.window.showWarningMessage(`Command ${cmdId} in flow not found, skipping.`);
                continue;
            }

            if (command.runInNewTerminal) {
                if (sharedBuffer.length > 0) {
                    baseTerminal.sendText(sharedBuffer.join(' && '));
                    sharedBuffer = [];
                }

                const terminal = this.terminalService.createNewTerminal(`Terminal Flow: ${command.title}`);
                terminal.show();
                await delay(NEW_TERMINAL_DELAY);
                if (shouldPrintTitle) {
                    terminal.sendText(`${getEchoCommand(command.title)} && ${command.command}`);
                } else {
                    terminal.sendText(command.command);
                }
            } else {
                let cmdStr = command.command;
                if (shouldPrintTitle) cmdStr = `${getEchoCommand(command.title)} && ${command.command}`;
                sharedBuffer.push(cmdStr);
            }
        }

        if (sharedBuffer.length > 0) {
            baseTerminal.sendText(sharedBuffer.join(' && '));
        }
    }
}
