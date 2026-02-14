import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

export interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
}

export class DataManager {
    private terminalDir: string;
    private commandsPath: string;
    private flowsPath: string;
    private _onDidChangeData = new vscode.EventEmitter<void>();
    public readonly onDidChangeData = this._onDidChangeData.event;
    private watcher: vscode.FileSystemWatcher | undefined;

    constructor(rootPath: string) {
        this.terminalDir = path.join(rootPath, '.terminal');
        this.commandsPath = path.join(this.terminalDir, 'commands.json');
        this.flowsPath = path.join(this.terminalDir, 'flows.json');
        this.ensureTerminalDirectory();
        this.setupWatcher();
    }

    private ensureTerminalDirectory() {
        if (!fs.existsSync(this.terminalDir)) {
            fs.mkdirSync(this.terminalDir);
        }
        if (!fs.existsSync(this.commandsPath)) {
            fs.writeFileSync(this.commandsPath, JSON.stringify([], null, 2));
        }
        if (!fs.existsSync(this.flowsPath)) {
            fs.writeFileSync(this.flowsPath, JSON.stringify([], null, 2));
        }
    }

    private setupWatcher() {
        // Watch for changes in the .terminal directory
        this.watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(this.terminalDir, '*.json')
        );

        this.watcher.onDidChange(() => this._onDidChangeData.fire());
        this.watcher.onDidCreate(() => this._onDidChangeData.fire());
        this.watcher.onDidDelete(() => this._onDidChangeData.fire());
    }

    public getCommands(): Command[] {
        try {
            if (fs.existsSync(this.commandsPath)) {
                const content = fs.readFileSync(this.commandsPath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading commands.json:', error);
        }
        return [];
    }

    public getFlows(): Flow[] {
        try {
            if (fs.existsSync(this.flowsPath)) {
                const content = fs.readFileSync(this.flowsPath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading flows.json:', error);
        }
        return [];
    }

    public saveCommand(command: Command) {
        const commands = this.getCommands();
        const index = commands.findIndex(c => c.id === command.id);
        if (index !== -1) {
            commands[index] = command;
        } else {
            commands.push(command);
        }
        this.writeCommands(commands);
    }

    public deleteCommand(id: string) {
        const commands = this.getCommands();
        const newCommands = commands.filter(c => c.id !== id);
        this.writeCommands(newCommands);
    }

    public saveFlow(flow: Flow) {
        const flows = this.getFlows();
        const index = flows.findIndex(f => f.id === flow.id);
        if (index !== -1) {
            flows[index] = flow;
        } else {
            flows.push(flow);
        }
        this.writeFlows(flows);
    }

    public deleteFlow(id: string) {
        const flows = this.getFlows();
        const newFlows = flows.filter(f => f.id !== id);
        this.writeFlows(newFlows);
    }

    private writeCommands(commands: Command[]) {
        try {
            fs.writeFileSync(this.commandsPath, JSON.stringify(commands, null, 2));
            // Event will be fired by watcher
        } catch (error) {
            console.error('Error writing commands.json:', error);
            vscode.window.showErrorMessage('Failed to save commands.');
        }
    }

    private writeFlows(flows: Flow[]) {
        try {
            fs.writeFileSync(this.flowsPath, JSON.stringify(flows, null, 2));
            // Event will be fired by watcher
        } catch (error) {
            console.error('Error writing flows.json:', error);
            vscode.window.showErrorMessage('Failed to save flows.');
        }
    }

    public getCommand(id: string): Command | undefined {
        return this.getCommands().find(c => c.id === id);
    }

    public getFlow(id: string): Flow | undefined {
        return this.getFlows().find(f => f.id === id);
    }

    public dispose() {
        if (this.watcher) {
            this.watcher.dispose();
        }
    }
}
