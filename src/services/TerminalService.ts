import * as vscode from 'vscode';

export class TerminalService {
    private _terminals: Map<string, vscode.Terminal> = new Map();

    public getTerminal(name: string = 'Terminal Flow'): { terminal: vscode.Terminal, isNew: boolean } {
        // Clean up closed terminals
        for (const [key, term] of this._terminals) {
            if (term.exitStatus !== undefined) {
                this._terminals.delete(key);
            }
        }

        let terminal = this._terminals.get(name);
        let isNew = false;
        if (!terminal) {
            terminal = vscode.window.createTerminal(name);
            this._terminals.set(name, terminal);
            isNew = true;
            vscode.window.onDidCloseTerminal(t => {
                if (t === terminal) {
                    this._terminals.delete(name);
                }
            });
        }
        return { terminal, isNew };
    }

    public createNewTerminal(name: string): vscode.Terminal {
        const terminal = vscode.window.createTerminal(name);
        return terminal;
    }

    public dispose() {
        this._terminals.forEach(t => t.dispose());
        this._terminals.clear();
    }
}
