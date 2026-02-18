import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Command {
    id: string; title: string; description: string; category: string; command: string; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

/**
 * Service for managing commands commands.
 */
export class CommandService {
    private workspaceStore: Store<Command[]>;
    private userStore: Store<Command[]> | undefined;
    private workspaceCategoryStore: Store<string[]>;
    private userCategoryStore: Store<string[]> | undefined;
    private _onDidChange = new Set<() => void>();

    /**
     * Creates an instance of CommandService.
     * @param workspaceDir The directory for workspace-specific storage.
     * @param userTerminalDir Optional directory for user-specific storage.
     */
    constructor(workspaceDir: string, userTerminalDir?: string) {
        this.workspaceStore = new Store<Command[]>(workspaceDir, 'commands.json', []);
        this.workspaceCategoryStore = new Store<string[]>(workspaceDir, 'commandCategories.json', []);

        if (userTerminalDir) {
            this.userStore = new Store<Command[]>(userTerminalDir, 'commands.json', []);
            this.userCategoryStore = new Store<string[]>(userTerminalDir, 'commandCategories.json', []);
        }
    }

    /**
     * Registers a callback to be invoked when commands change.
     * @param callback The callback function.
     */
    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }

    /**
     * Triggers the change event listeners.
     */
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    /**
     * Retrieves all commands from both workspace and user stores.
     * @returns A promise resolving to an array of commands.
     */
    public async getCommands(): Promise<Command[]> {
        const workspaceCommands = (await this.workspaceStore.read()).map(c => ({ ...c, source: 'workspace' as const }));
        const userCommands = this.userStore ? (await this.userStore.read()).map(c => ({ ...c, source: 'user' as const })) : [];
        return [...workspaceCommands, ...userCommands];
    }

    /**
     * Saves a command to the appropriate store based on its source.
     * @param command The command to save.
     */
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

    /**
     * Deletes a command by its ID.
     * @param id The ID of the command to delete.
     */
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

    /**
     * Moves a command from one source (workspace/user) to another.
     * @param id The ID of the command to move.
     * @param targetSource The target source ('workspace' or 'user').
     */
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

    /**
     * Cleans up unused categories from the store.
     * @param commands The list of current commands.
     * @param isUser Whether to check the user store or workspace store.
     */
    private async performCategoryCleanup(commands: Command[], isUser: boolean) {
        const store = isUser && this.userCategoryStore ? this.userCategoryStore : this.workspaceCategoryStore;
        const currentOrder = await store.read();
        const newOrder = cleanupCategories(currentOrder, commands);
        if (newOrder) {
            await store.write(newOrder);
        }
    }

    /**
     * Overwrites the commands logic.
     * @param commands The new list of commands.
     */
    public async setCommands(commands: Command[]) {
        const workspaceCmds = commands.filter(c => c.source !== 'user');
        const userCmds = commands.filter(c => c.source === 'user');

        await this.workspaceStore.write(workspaceCmds);
        if (this.userStore) {
            await this.userStore.write(userCmds);
        }
        this.fireChange();
    }

    /**
     * Retrieves the merged category order from both stores.
     * @returns A promise resolving to an array of category names.
     */
    public async getCategoryOrder(): Promise<string[]> {
        const workspaceOrder = await this.workspaceCategoryStore.read();
        const userOrder = this.userCategoryStore ? await this.userCategoryStore.read() : [];
        // Merge unique categories
        return Array.from(new Set([...workspaceOrder, ...userOrder]));
    }

    /**
     * Saves the category order.
     * @param order The new order of categories.
     */
    public async saveCategoryOrder(order: string[]) {

        await this.workspaceCategoryStore.write(order);

        if (this.userCategoryStore) {
            await this.userCategoryStore.write(order);
        }
        this.fireChange();
    }
}
