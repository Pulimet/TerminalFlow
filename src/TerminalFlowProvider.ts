import * as vscode from 'vscode';
import { DataManager } from './DataManager';

export class TerminalFlowProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'terminal-flow-view';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _dataManager: DataManager
    ) {
        // Listen to data changes to update the view
        this._dataManager.onDidChangeData(() => {
            this.refreshData();
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'runCommand':
                    vscode.commands.executeCommand('terminal-flow.runCommand', data.id);
                    break;
                case 'runFlow':
                    vscode.commands.executeCommand('terminal-flow.runFlow', data.id);
                    break;
                case 'saveCommand':
                    this._dataManager.saveCommand(data.data);
                    break;
                case 'deleteCommand':
                    this._dataManager.deleteCommand(data.id);
                    break;
                case 'saveFlow':
                    this._dataManager.saveFlow(data.data);
                    break;
                case 'deleteFlow':
                    this._dataManager.deleteFlow(data.id);
                    break;
                case 'refresh':
                    this.refreshData();
                    break;
            }
        });

        // Initial data load
        this.refreshData();
    }

    private refreshData() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateData',
                commands: this._dataManager.getCommands(),
                flows: this._dataManager.getFlows()
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'style.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>Terminal Flow</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
