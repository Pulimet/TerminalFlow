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

        if (flow.runInNewTerminal) {
            await this.runFlowInNewTerminal(flow.title, sequenceToRun, shouldPrintTitle);
        } else {
            await this.runMixedFlow(sequenceToRun, shouldPrintTitle);
        }
    }

    private async runFlowInNewTerminal(title: string, sequence: string[], shouldPrintTitle: boolean) {
        const terminal = this.terminalService.createNewTerminal(`Terminal Flow: ${title}`);
        terminal.show();
        await delay(NEW_TERMINAL_DELAY);
        const commands: string[] = [];

        for (let i = 0; i < sequence.length; i++) {
            const cmdId = sequence[i];
            const isFirst = i === 0;
            const cmdStr = await this.commandRunner.resolveCommand(cmdId, shouldPrintTitle, isFirst);
            if (cmdStr) commands.push(cmdStr);
        }

        if (commands.length > 0) terminal.sendText(commands.join(' && '));
    }

    private async runMixedFlow(sequence: string[], shouldPrintTitle: boolean) {
        const { terminal: sharedTerminal, isNew } = this.terminalService.getTerminal();
        sharedTerminal.show();
        if (isNew) await delay(NEW_TERMINAL_DELAY);

        let sharedBuffer: string[] = [];

        for (const cmdId of sequence) {
            const specialCmd = resolveSpecialCommand(cmdId);
            if (specialCmd) {
                const isFirst = sharedBuffer.length === 0; // If buffer empty, this is first in chain
                const cmdStr = await this.commandRunner.resolveCommand(cmdId, shouldPrintTitle, isFirst);
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
                    sharedTerminal.sendText(sharedBuffer.join(' && '));
                    sharedBuffer = [];
                }

                const terminal = this.terminalService.createNewTerminal(`Terminal Flow: ${command.title}`);
                terminal.show();
                await delay(NEW_TERMINAL_DELAY);
                if (shouldPrintTitle) {
                    terminal.sendText(`${getEchoCommand(command.title, true)} && ${command.command}`);
                } else {
                    terminal.sendText(command.command);
                }
            } else {
                let cmdStr = command.command;
                const isFirst = sharedBuffer.length === 0;
                if (shouldPrintTitle) cmdStr = `${getEchoCommand(command.title, isFirst)} && ${command.command}`;
                sharedBuffer.push(cmdStr);
            }
        }

        if (sharedBuffer.length > 0) {
            sharedTerminal.sendText(sharedBuffer.join(' && '));
        }
    }
}
