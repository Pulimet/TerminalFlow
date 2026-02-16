import * as vscode from 'vscode';
import * as path from 'path';
import { Store } from '../utils/Store';

export interface Command {
    id: string; title: string; description: string; category: string; command: string;
}

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[];
}

export class DataManager {
    private commandStore: Store<Command[]>;
    private flowStore: Store<Flow[]>;
    private _onDidChangeData = new vscode.EventEmitter<void>();
    public readonly onDidChangeData = this._onDidChangeData.event;
    private watcher: vscode.FileSystemWatcher | undefined;

    constructor(rootPath: string) {
        const terminalDir = path.join(rootPath, '.terminal');
        this.commandStore = new Store<Command[]>(terminalDir, 'commands.json', []);
        this.flowStore = new Store<Flow[]>(terminalDir, 'flows.json', []);
        this.setupWatcher(terminalDir);
    }

    private setupWatcher(dir: string) {
        this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dir, '*.json'));
        this.watcher.onDidChange(() => this._onDidChangeData.fire());
        this.watcher.onDidCreate(() => this._onDidChangeData.fire());
        this.watcher.onDidDelete(() => this._onDidChangeData.fire());
    }

    public async getCommands(): Promise<Command[]> { return await this.commandStore.read(); }
    public async getFlows(): Promise<Flow[]> { return await this.flowStore.read(); }

    public async saveCommand(command: Command) {
        const commands = await this.getCommands();
        const index = commands.findIndex(c => c.id === command.id);
        if (index !== -1) commands[index] = command;
        else commands.push(command);
        await this.commandStore.write(commands);
        this._onDidChangeData.fire();
    }

    public async deleteCommand(id: string) {
        const commands = await this.getCommands();
        await this.commandStore.write(commands.filter(c => c.id !== id));
        this._onDidChangeData.fire();
    }

    public async saveFlow(flow: Flow) {
        const flows = await this.getFlows();
        const index = flows.findIndex(f => f.id === flow.id);
        if (index !== -1) flows[index] = flow;
        else flows.push(flow);
        await this.flowStore.write(flows);
        this._onDidChangeData.fire();
    }

    public async deleteFlow(id: string) {
        const flows = await this.getFlows();
        await this.flowStore.write(flows.filter(f => f.id !== id));
        this._onDidChangeData.fire();
    }

    public async getCommand(id: string): Promise<Command | undefined> {
        return (await this.getCommands()).find(c => c.id === id);
    }

    public async getFlow(id: string): Promise<Flow | undefined> {
        return (await this.getFlows()).find(f => f.id === id);
    }

    public dispose() { this.watcher?.dispose(); }
}
