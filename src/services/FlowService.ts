import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[]; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

export class FlowService {
    private workspaceStore: Store<Flow[]>;
    private userStore: Store<Flow[]> | undefined;
    private workspaceCategoryStore: Store<string[]>;
    private userCategoryStore: Store<string[]> | undefined;
    private _onDidChange = new Set<() => void>();

    constructor(workspaceDir: string, userTerminalDir?: string) {
        this.workspaceStore = new Store<Flow[]>(workspaceDir, 'flows.json', []);
        this.workspaceCategoryStore = new Store<string[]>(workspaceDir, 'flowCategories.json', []);

        if (userTerminalDir) {
            this.userStore = new Store<Flow[]>(userTerminalDir, 'flows.json', []);
            this.userCategoryStore = new Store<string[]>(userTerminalDir, 'flowCategories.json', []);
        }
    }

    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    public async getFlows(): Promise<Flow[]> {
        const workspaceFlows = (await this.workspaceStore.read()).map(f => ({ ...f, source: 'workspace' as const }));
        const userFlows = this.userStore ? (await this.userStore.read()).map(f => ({ ...f, source: 'user' as const })) : [];
        return [...workspaceFlows, ...userFlows];
    }

    public async saveFlow(flow: Flow) {
        const targetStore = flow.source === 'user' && this.userStore ? this.userStore : this.workspaceStore;

        const flows = await targetStore.read();
        const index = flows.findIndex(f => f.id === flow.id);
        if (index !== -1) flows[index] = flow;
        else flows.push(flow);

        await targetStore.write(flows);
        await this.performCategoryCleanup(flows, flow.source === 'user');
        this.fireChange();
    }

    public async deleteFlow(id: string) {
        const allFlows = await this.getFlows();
        const flow = allFlows.find(f => f.id === id);
        if (!flow) return;

        const targetStore = flow.source === 'user' && this.userStore ? this.userStore : this.workspaceStore;
        const flows = await targetStore.read();
        const newFlows = flows.filter(f => f.id !== id);

        await targetStore.write(newFlows);
        await this.performCategoryCleanup(newFlows, flow.source === 'user');
        this.fireChange();
    }

    public async moveFlow(id: string, targetSource: 'workspace' | 'user') {
        const allFlows = await this.getFlows();
        const flow = allFlows.find(f => f.id === id);
        if (!flow || flow.source === targetSource) return;

        // 1. Remove from old source
        await this.deleteFlow(id);

        // 2. Add to new source
        const newFlow = { ...flow, source: targetSource };
        await this.saveFlow(newFlow);
    }

    private async performCategoryCleanup(flows: Flow[], isUser: boolean) {
        const store = isUser && this.userCategoryStore ? this.userCategoryStore : this.workspaceCategoryStore;
        const currentOrder = await store.read();
        const newOrder = cleanupCategories(currentOrder, flows);
        if (newOrder) {
            await store.write(newOrder);
        }
    }

    public async setFlows(flows: Flow[]) {
        const workspaceFlows = flows.filter(f => f.source !== 'user');
        const userFlows = flows.filter(f => f.source === 'user');

        await this.workspaceStore.write(workspaceFlows);
        if (this.userStore) {
            await this.userStore.write(userFlows);
        }
        this.fireChange();
    }

    public async getCategoryOrder(): Promise<string[]> {
        const workspaceOrder = await this.workspaceCategoryStore.read();
        const userOrder = this.userCategoryStore ? await this.userCategoryStore.read() : [];
        return Array.from(new Set([...workspaceOrder, ...userOrder]));
    }

    public async saveCategoryOrder(order: string[]) {
        await this.workspaceCategoryStore.write(order);
        if (this.userCategoryStore) {
            await this.userCategoryStore.write(order);
        }
        this.fireChange();
    }
}
