import * as vscode from 'vscode';
import { DataManager } from '../services/DataManager';
import { CommandRunner } from '../services/CommandRunner';
import { FlowRunner } from '../services/FlowRunner';

export async function searchAndRun(dataManager: DataManager, commandRunner: CommandRunner, flowRunner: FlowRunner) {
    const commands = await dataManager.commandService.getCommands();
    const flows = await dataManager.flowService.getFlows();

    const items: (vscode.QuickPickItem & { type: 'command' | 'flow', id: string })[] = [
        ...commands.map(c => ({
            label: `$(terminal) ${c.title}`,
            description: `Command${c.category ? ` (${c.category})` : ''}`,
            detail: c.description,
            type: 'command' as const,
            id: c.id
        })),
        ...flows.map(f => ({
            label: `$(git-merge) ${f.title}`,
            description: 'Flow',
            detail: f.description,
            type: 'flow' as const,
            id: f.id
        }))
    ];

    if (items.length === 0) {
        vscode.window.showInformationMessage('No Terminal Flow commands or flows found.');
        return;
    }

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Search and run a Terminal Flow command or flow...',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (selected) {
        if (selected.type === 'command') {
            commandRunner.runCommand(selected.id);
        } else if (selected.type === 'flow') {
            flowRunner.runFlow(selected.id);
        }
    }
}
