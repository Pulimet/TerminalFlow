import { BaseService } from './BaseService';

export interface Command {
    id: string; title: string; description: string; category: string; command: string; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

export class CommandService extends BaseService<Command> {
    constructor(workspaceDir: string, userTerminalDir?: string) {
        super(workspaceDir, 'commands.json', 'commandCategories.json', userTerminalDir);
    }
    
    public getCommands() { return this.getItems(); }
    public saveCommand(cmd: Command) { return this.saveItem(cmd); }
    public deleteCommand(id: string) { return this.deleteItem(id); }
    public moveCommand(id: string, target: 'workspace' | 'user') { return this.moveItem(id, target); }
    public setCommands(cmds: Command[]) { return this.setItems(cmds); }
    public getCommandsByIds(ids: string[]) { return this.getItemsByIds(ids); }
    public importCommands(cmds: Command[]) { return this.importItems(cmds); }
}
