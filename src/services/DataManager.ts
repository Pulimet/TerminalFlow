import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { CommandService, Command } from './CommandService';
import { FlowService, Flow } from './FlowService';

export { Command, Flow };

export class DataManager {
    public readonly commandService: CommandService;
    public readonly flowService: FlowService;
    private _onDidChangeData = new vscode.EventEmitter<void>();
    public readonly onDidChangeData = this._onDidChangeData.event;
    private watchers: vscode.FileSystemWatcher[] = [];

    constructor(rootPath: string) {
        const terminalDir = path.join(rootPath, '.terminal');
        const userTerminalDir = path.join(os.homedir(), '.terminal');

        this.commandService = new CommandService(terminalDir, userTerminalDir);
        this.flowService = new FlowService(terminalDir, userTerminalDir);

        this.commandService.onDidChange(() => this._onDidChangeData.fire());
        this.flowService.onDidChange(() => this._onDidChangeData.fire());

        this.setupWatcher(terminalDir);
        this.setupWatcher(userTerminalDir);
    }

    private setupWatcher(dir: string) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dir, '*.json'));
        watcher.onDidChange(() => this.fireAll());
        watcher.onDidCreate(() => this.fireAll());
        watcher.onDidDelete(() => this.fireAll());
        this.watchers.push(watcher);
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

    public dispose() {
        this.watchers.forEach(w => w.dispose());
    }
}
