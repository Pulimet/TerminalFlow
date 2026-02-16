import * as vscode from 'vscode';
import * as path from 'path';
import { CommandService, Command } from './CommandService';
import { FlowService, Flow } from './FlowService';

export { Command, Flow };

export class DataManager {
    public readonly commandService: CommandService;
    public readonly flowService: FlowService;
    private _onDidChangeData = new vscode.EventEmitter<void>();
    public readonly onDidChangeData = this._onDidChangeData.event;
    private watcher: vscode.FileSystemWatcher | undefined;

    constructor(rootPath: string) {
        const terminalDir = path.join(rootPath, '.terminal');
        this.commandService = new CommandService(terminalDir);
        this.flowService = new FlowService(terminalDir);

        this.commandService.onDidChange(() => this._onDidChangeData.fire());
        this.flowService.onDidChange(() => this._onDidChangeData.fire());
        this.setupWatcher(terminalDir);
    }

    private setupWatcher(dir: string) {
        this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dir, '*.json'));
        this.watcher.onDidChange(() => this.fireAll());
        this.watcher.onDidCreate(() => this.fireAll());
        this.watcher.onDidDelete(() => this.fireAll());
    }

    private fireAll() {
        this.commandService.fireChange();
        this.flowService.fireChange();
        this._onDidChangeData.fire();
    }

    public async getCommand(id: string): Promise<Command | undefined> {
        return (await this.commandService.getCommands()).find(c => c.id === id);
    }

    public async getFlow(id: string): Promise<Flow | undefined> {
        return (await this.flowService.getFlows()).find(f => f.id === id);
    }

    public dispose() { this.watcher?.dispose(); }
}
