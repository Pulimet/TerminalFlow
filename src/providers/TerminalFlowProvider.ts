import * as vscode from 'vscode';
import { DataManager } from '../services/DataManager';

/**
 * Provider for the Terminal Flow webview view.
 */
export class TerminalFlowProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'terminal-flow-view';
    private _view?: vscode.WebviewView;
    private _scope: 'workspace' | 'user';
    private _tab: 'commands' | 'flows';

    /**
     * Creates an instance of TerminalFlowProvider.
     * @param _context The extension context.
     * @param _dataManager The data manager instance.
     */
    constructor(private readonly _context: vscode.ExtensionContext, private readonly _dataManager: DataManager) {
        this._scope = this._context.workspaceState.get<'workspace' | 'user'>('terminal-flow.scope', 'workspace');
        this._tab = this._context.workspaceState.get<'commands' | 'flows'>('terminal-flow.tab', 'commands');
        this._dataManager.onDidChangeData(() => this.refreshData());
    }

    /**
     * Resolves the webview view.
     * @param webviewView The webview view to resolve.
     */
    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._context.extensionUri] };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'runCommand': vscode.commands.executeCommand('terminal-flow.runCommand', data.id); break;
                case 'runFlow': vscode.commands.executeCommand('terminal-flow.runFlow', data.id, data.fromIndex); break;
                case 'saveCommand': await this._dataManager.commandService.saveCommand(data.data); break;
                case 'deleteCommand': {
                    const answer = await vscode.window.showWarningMessage('Are you sure you want to delete this command?', { modal: true }, 'Delete');
                    if (answer === 'Delete') await this._dataManager.commandService.deleteCommand(data.id);
                    break;
                }
                case 'saveFlow': await this._dataManager.flowService.saveFlow(data.data); break;
                case 'deleteFlow': {
                    const answer = await vscode.window.showWarningMessage('Are you sure you want to delete this flow?', { modal: true }, 'Delete');
                    if (answer === 'Delete') await this._dataManager.flowService.deleteFlow(data.id);
                    break;
                }
                case 'reorderCommands': await this._dataManager.commandService.setCommands(data.data); break;
                case 'reorderFlows': await this._dataManager.flowService.setFlows(data.data); break;
                case 'saveCommandCategoryOrder': await this._dataManager.commandService.saveCategoryOrder(data.data); break;
                case 'saveFlowCategoryOrder': await this._dataManager.flowService.saveCategoryOrder(data.data); break;

                case 'moveCommand': await this._dataManager.commandService.moveCommand(data.id, data.targetSource); break;
                case 'moveFlow': await this._dataManager.flowService.moveFlow(data.id, data.targetSource); break;

                case 'saveScope':
                    this._scope = data.scope;
                    await this._context.workspaceState.update('terminal-flow.scope', this._scope);
                    break;

                case 'saveTab':
                    this._tab = data.tab;
                    await this._context.workspaceState.update('terminal-flow.tab', this._tab);
                    break;

                case 'refresh': this.refreshData(); break;
            }
        });
        this.refreshData();
    }

    /**
     * Refreshes the data in the webview.
     */
    private async refreshData() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateData',
                commands: await this._dataManager.commandService.getCommands(),
                flows: await this._dataManager.flowService.getFlows(),
                commandCategoryOrder: await this._dataManager.commandService.getCategoryOrder(),
                flowCategoryOrder: await this._dataManager.flowService.getCategoryOrder(),
                scope: this._scope,
                tab: this._tab
            });
        }
    }

    /**
     * Generates the HTML content for the webview.
     * @param webview The webview instance.
     * @returns The HTML string.
     */
    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'dist', 'webview.js'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'dist', 'webview.css'));
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>Terminal Flow</title>
            </head>
            <body><div id="root"></div><script nonce="${nonce}" src="${scriptUri}"></script></body></html>`;
    }
}

/**
 * Generates a random nonce string.
 * @returns A random 32-character string.
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
