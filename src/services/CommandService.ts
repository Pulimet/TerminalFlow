import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Command {
    id: string; title: string; description: string; category: string; command: string; runInNewTerminal?: boolean;
}

export class CommandService {
    private store: Store<Command[]>;
    private categoryStore: Store<string[]>;
    private _onDidChange = new Set<() => void>();

    constructor(terminalDir: string) {
        this.store = new Store<Command[]>(terminalDir, 'commands.json', []);
        this.categoryStore = new Store<string[]>(terminalDir, 'commandCategories.json', []);
    }

    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    public async getCommands(): Promise<Command[]> { return await this.store.read(); }

    public async saveCommand(command: Command) {
        const commands = await this.getCommands();
        const index = commands.findIndex(c => c.id === command.id);
        if (index !== -1) commands[index] = command;
        else commands.push(command);
        await this.store.write(commands);
        await this.performCategoryCleanup(commands);
        this.fireChange();
    }

    public async deleteCommand(id: string) {
        const commands = await this.getCommands();
        const newCommands = commands.filter(c => c.id !== id);
        await this.store.write(newCommands);
        await this.performCategoryCleanup(newCommands);
        this.fireChange();
    }

    private async performCategoryCleanup(commands: Command[]) {
        const currentOrder = await this.getCategoryOrder();
        const newOrder = cleanupCategories(currentOrder, commands);
        if (newOrder) {
            await this.saveCategoryOrder(newOrder);
        }
    }

    public async setCommands(commands: Command[]) {
        await this.store.write(commands);
        this.fireChange();
    }

    public async getCategoryOrder(): Promise<string[]> { return await this.categoryStore.read(); }

    public async saveCategoryOrder(order: string[]) {
        await this.categoryStore.write(order);
        this.fireChange();
    }
}
