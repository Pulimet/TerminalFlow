import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Command {
    id: string; title: string; description: string; category: string; command: string; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

export class CommandService {
    private workspaceStore: Store<Command[]>;
    private userStore: Store<Command[]> | undefined;
    private workspaceCategoryStore: Store<string[]>;
    private userCategoryStore: Store<string[]> | undefined;
    private _onDidChange = new Set<() => void>();

    constructor(workspaceDir: string, userTerminalDir?: string) {
        this.workspaceStore = new Store<Command[]>(workspaceDir, 'commands.json', []);
        this.workspaceCategoryStore = new Store<string[]>(workspaceDir, 'commandCategories.json', []);

        if (userTerminalDir) {
            this.userStore = new Store<Command[]>(userTerminalDir, 'commands.json', []);
            this.userCategoryStore = new Store<string[]>(userTerminalDir, 'commandCategories.json', []);
        }
    }

    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    public async getCommands(): Promise<Command[]> {
        const workspaceCommands = (await this.workspaceStore.read()).map(c => ({ ...c, source: 'workspace' as const }));
        const userCommands = this.userStore ? (await this.userStore.read()).map(c => ({ ...c, source: 'user' as const })) : [];
        return [...workspaceCommands, ...userCommands];
    }

    public async saveCommand(command: Command) {
        const targetStore = command.source === 'user' && this.userStore ? this.userStore : this.workspaceStore;

        const commands = await targetStore.read();
        const index = commands.findIndex(c => c.id === command.id);
        if (index !== -1) commands[index] = command;
        else commands.push(command);

        await targetStore.write(commands);
        await this.performCategoryCleanup(commands, command.source === 'user');
        this.fireChange();
    }

    public async deleteCommand(id: string) {
        // We need to find where it is first
        const allCommands = await this.getCommands();
        const command = allCommands.find(c => c.id === id);
        if (!command) return;

        const targetStore = command.source === 'user' && this.userStore ? this.userStore : this.workspaceStore;
        const commands = await targetStore.read();
        const newCommands = commands.filter(c => c.id !== id);

        await targetStore.write(newCommands);
        await this.performCategoryCleanup(newCommands, command.source === 'user');
        this.fireChange();
    }

    public async moveCommand(id: string, targetSource: 'workspace' | 'user') {
        const allCommands = await this.getCommands();
        const command = allCommands.find(c => c.id === id);
        if (!command || command.source === targetSource) return;

        // 1. Remove from old source
        await this.deleteCommand(id);

        // 2. Add to new source
        const newCommand = { ...command, source: targetSource };
        await this.saveCommand(newCommand);
    }

    private async performCategoryCleanup(commands: Command[], isUser: boolean) {
        const store = isUser && this.userCategoryStore ? this.userCategoryStore : this.workspaceCategoryStore;
        const currentOrder = await store.read();
        const newOrder = cleanupCategories(currentOrder, commands);
        if (newOrder) {
            await store.write(newOrder);
        }
    }

    // This logic might need refinement if we want to support setting raw commands to a specific store
    // But for now, this matches the existing signature used by DataManager/Webview
    public async setCommands(commands: Command[]) {
        // This is tricky with dual storage. 
        // Typically setCommands is used for reordering or bulk updates. 
        // If we receive a mixed list, we should save them to their respective stores.

        const workspaceCmds = commands.filter(c => c.source !== 'user');
        const userCmds = commands.filter(c => c.source === 'user');

        await this.workspaceStore.write(workspaceCmds);
        if (this.userStore) {
            await this.userStore.write(userCmds);
        }
        this.fireChange();
    }

    public async getCategoryOrder(): Promise<string[]> {
        const workspaceOrder = await this.workspaceCategoryStore.read();
        const userOrder = this.userCategoryStore ? await this.userCategoryStore.read() : [];
        // Merge unique categories
        return Array.from(new Set([...workspaceOrder, ...userOrder]));
    }

    public async saveCategoryOrder(order: string[]) {
        // This is ambiguous. If we reorder categories in UI, where do we save the order?
        // Current simple approach: Save the full order to Workspace, 
        // and for User, only save categories that exist in User commands? 
        // OR: Save the full order to both to keep them in sync as much as possible?
        // Let's safe full order to workspace, and valid categories to user.

        await this.workspaceCategoryStore.write(order);

        if (this.userCategoryStore) {
            // For user store, maybe just save the same order?
            // It stores strings, so it doesn't hurt to have extra categories in the order list.
            await this.userCategoryStore.write(order);
        }
        this.fireChange();
    }
}
