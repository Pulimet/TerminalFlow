import * as vscode from 'vscode';
import { DataManager } from '../services/DataManager';

export const handleWebviewMessage = async (
    data: any, dataManager: DataManager, context: vscode.ExtensionContext,
    getScope: () => 'workspace' | 'user', setScope: (s: 'workspace' | 'user') => void,
    setTab: (t: 'commands' | 'flows') => void, refreshData: () => void
) => {
    const scope = getScope();
    switch (data.type) {
        case 'runCommand': vscode.commands.executeCommand('terminal-flow.runCommand', data.id); break;
        case 'runFlow': vscode.commands.executeCommand('terminal-flow.runFlow', data.id, data.fromIndex); break;
        case 'saveCommand': await dataManager.commandService.saveCommand(data.data); break;
        case 'deleteCommand': {
            const allFlows = await dataManager.flowService.getFlows();
            const usingFlows = allFlows.filter(f => f.sequence.includes(data.id));
            if (usingFlows.length > 0) {
                const names = usingFlows.map(f => `"${f.title}"`).join(', ');
                vscode.window.showErrorMessage(`Cannot delete: command is used in flows: ${names}`);
                break;
            }
            if (await vscode.window.showWarningMessage('Are you sure you want to delete this command?', { modal: true }, 'Delete') === 'Delete') await dataManager.commandService.deleteCommand(data.id);
            break;
        }
        case 'saveFlow': await dataManager.flowService.saveFlow(data.data); break;
        case 'deleteFlow':
            if (await vscode.window.showWarningMessage('Are you sure you want to delete this flow?', { modal: true }, 'Delete') === 'Delete') await dataManager.flowService.deleteFlow(data.id);
            break;
        case 'reorderCommands': await dataManager.commandService.setCommands(data.data); break;
        case 'reorderFlows': await dataManager.flowService.setFlows(data.data); break;
        case 'saveCommandCategoryOrder': await dataManager.commandService.saveCategoryOrder(data.data, scope); break;
        case 'saveFlowCategoryOrder': await dataManager.flowService.saveCategoryOrder(data.data, scope); break;
        case 'moveCommand': await dataManager.commandService.moveCommand(data.id, data.targetSource); break;
        case 'moveFlow': await dataManager.flowService.moveFlow(data.id, data.targetSource); break;
        case 'copyToClipboard': await vscode.env.clipboard.writeText(data.text); vscode.window.showInformationMessage('Command copied to clipboard!'); break;
        case 'saveScope': setScope(data.scope); await context.workspaceState.update('terminal-flow.scope', data.scope); refreshData(); break;
        case 'saveTab': setTab(data.tab); await context.workspaceState.update('terminal-flow.tab', data.tab); refreshData(); break;
        case 'refresh': refreshData(); break;
        case 'exportCommands': {
            const cmds = await dataManager.commandService.getCommands();
            const exp = data.ids ? cmds.filter(c => data.ids.includes(c.id)) : cmds.filter(c => (c.source || 'workspace') === scope);
            const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, saveLabel: 'Export Commands' });
            if (uri) { await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(exp, null, 2))); vscode.window.showInformationMessage('Exported successfully.'); }
            break;
        }
        case 'importCommands': {
            const uri = await vscode.window.showOpenDialog({ filters: { 'JSON': ['json'] }, canSelectMany: false });
            if (uri?.[0]) {
                const imported = JSON.parse((await vscode.workspace.fs.readFile(uri[0])).toString());
                const toImport = Array.isArray(imported) ? imported : imported.commands;
                if (toImport) { await dataManager.commandService.importCommands(toImport); vscode.window.showInformationMessage('Imported successfully.'); }
            }
            break;
        }
        case 'exportFlows': {
            const fls = await dataManager.flowService.getFlows();
            const fExp = data.ids ? fls.filter(f => data.ids.includes(f.id)) : fls.filter(f => (f.source || 'workspace') === scope);
            const cExp = await dataManager.commandService.getCommandsByIds(dataManager.flowService.getDependentCommandIds(fExp));
            const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, saveLabel: 'Export Flows' });
            if (uri) { await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify({ flows: fExp, commands: cExp }, null, 2))); vscode.window.showInformationMessage('Exported.'); }
            break;
        }
        case 'importFlows': {
            const uri = await vscode.window.showOpenDialog({ filters: { 'JSON': ['json'] }, canSelectMany: false });
            if (uri?.[0]) {
                const imp = JSON.parse((await vscode.workspace.fs.readFile(uri[0])).toString());
                if (imp.flows) await dataManager.flowService.importFlows(imp.flows);
                if (imp.commands) await dataManager.commandService.importCommands(imp.commands);
                vscode.window.showInformationMessage('Imported successfully.');
            }
            break;
        }
    }
};
