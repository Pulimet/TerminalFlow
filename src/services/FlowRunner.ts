import * as vscode from 'vscode';
import { DataManager } from './DataManager';
import { CommandRunner } from './CommandRunner';
import { TerminalService } from './TerminalService';

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
        const commands: string[] = [];

        for (const cmdId of sequence) {
            const cmdStr = await this.commandRunner.resolveCommand(cmdId, shouldPrintTitle);
            if (cmdStr) commands.push(cmdStr);
        }

        if (commands.length > 0) terminal.sendText(commands.join(' && '));
    }

    private async runMixedFlow(sequence: string[], shouldPrintTitle: boolean) {
        const sharedTerminal = this.terminalService.getTerminal();
        sharedTerminal.show();

        let sharedBuffer: string[] = [];

        for (const cmdId of sequence) {
            if (cmdId.startsWith('__sleep:') || cmdId.startsWith('__echo:')) {
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
                    sharedTerminal.sendText(sharedBuffer.join(' && '));
                    sharedBuffer = [];
                }

                const terminal = this.terminalService.createNewTerminal(`Terminal Flow: ${command.title}`);
                terminal.show();
                if (shouldPrintTitle) {
                    terminal.sendText(`echo -e "\\033[36mRunning: ${command.title}\\033[0m" && ${command.command}`);
                } else {
                    terminal.sendText(command.command);
                }
            } else {
                let cmdStr = command.command;
                if (shouldPrintTitle) cmdStr = `echo -e "\\033[36mRunning: ${command.title}\\033[0m" && ${command.command}`;
                sharedBuffer.push(cmdStr);
            }
        }

        if (sharedBuffer.length > 0) {
            sharedTerminal.sendText(sharedBuffer.join(' && '));
        }
    }
}
