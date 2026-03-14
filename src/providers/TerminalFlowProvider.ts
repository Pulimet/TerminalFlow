import * as vscode from 'vscode';
import { DataManager } from '../services/DataManager';
import { handleWebviewMessage } from './messageHandler';

export class TerminalFlowProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'terminal-flow-view';
    private _view?: vscode.WebviewView;
    private _scope: 'workspace' | 'user';
    private _tab: 'commands' | 'flows';

    constructor(private readonly _context: vscode.ExtensionContext, private readonly _dataManager: DataManager) {
        this._scope = this._context.workspaceState.get<'workspace' | 'user'>('terminal-flow.scope', 'workspace');
        this._tab = this._context.workspaceState.get<'commands' | 'flows'>('terminal-flow.tab', 'commands');
        this._dataManager.onDidChangeData(() => this.refreshData());
    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._context.extensionUri] };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((data) => handleWebviewMessage(
            data, this._dataManager, this._context,
            () => this._scope, (s) => { this._scope = s; },
            (t) => { this._tab = t; }, () => this.refreshData()
        ));
        this.refreshData();
    }

    private async refreshData() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateData',
                commands: await this._dataManager.commandService.getCommands(),
                flows: await this._dataManager.flowService.getFlows(),
                commandCategoryOrder: await this._dataManager.commandService.getCategoryOrder(this._scope),
                flowCategoryOrder: await this._dataManager.flowService.getCategoryOrder(this._scope),
                scope: this._scope,
                tab: this._tab
            });
        }
    }

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

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
