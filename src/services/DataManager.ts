import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { CommandService, Command } from './CommandService';
import { FlowService, Flow } from './FlowService';

export { Command, Flow };

/**
 * Manages data consistency between commands and flows.
 */
export class DataManager {
    public readonly commandService: CommandService;
    public readonly flowService: FlowService;
    private _onDidChangeData = new vscode.EventEmitter<void>();
    public readonly onDidChangeData = this._onDidChangeData.event;
    private watchers: vscode.FileSystemWatcher[] = [];

    /**
     * Creates an instance of DataManager.
     * @param rootPath The root path of the workspace.
     */
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

    /**
     * Sets up a file system watcher for JSON files in a directory.
     * @param dir The directory to watch.
     */
    private setupWatcher(dir: string) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dir, '*.json'));
        watcher.onDidChange(() => this.fireAll());
        watcher.onDidCreate(() => this.fireAll());
        watcher.onDidDelete(() => this.fireAll());
        this.watchers.push(watcher);
    }

    /**
     * Triggers change events for all services.
     */
    private fireAll() {
        this.commandService.fireChange();
        this.flowService.fireChange();
        this._onDidChangeData.fire();
    }

    /**
     * Retrieves a command by its ID.
     * @param id The command ID.
     * @returns A promise resolving to the command or undefined.
     */
    public async getCommand(id: string): Promise<Command | undefined> {
        return (await this.commandService.getCommands()).find(c => c.id === id);
    }

    /**
     * Retrieves a flow by its ID.
     * @param id The flow ID.
     * @returns A promise resolving to the flow or undefined.
     */
    public async getFlow(id: string): Promise<Flow | undefined> {
        return (await this.flowService.getFlows()).find(f => f.id === id);
    }

    /**
     * Disposes of the data manager and its watchers.
     */
    public dispose() {
        this.watchers.forEach(w => w.dispose());
    }
}
