import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[]; runInNewTerminal?: boolean;
}

export class FlowService {
    private store: Store<Flow[]>;
    private categoryStore: Store<string[]>;
    private _onDidChange = new Set<() => void>();

    constructor(terminalDir: string) {
        this.store = new Store<Flow[]>(terminalDir, 'flows.json', []);
        this.categoryStore = new Store<string[]>(terminalDir, 'flowCategories.json', []);
    }

    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    public async getFlows(): Promise<Flow[]> { return await this.store.read(); }

    public async saveFlow(flow: Flow) {
        const flows = await this.getFlows();
        const index = flows.findIndex(f => f.id === flow.id);
        if (index !== -1) flows[index] = flow;
        else flows.push(flow);
        await this.store.write(flows);
        await this.performCategoryCleanup(flows);
        this.fireChange();
    }

    public async deleteFlow(id: string) {
        const flows = await this.getFlows();
        const newFlows = flows.filter(f => f.id !== id);
        await this.store.write(newFlows);
        await this.performCategoryCleanup(newFlows);
        this.fireChange();
    }

    private async performCategoryCleanup(flows: Flow[]) {
        const currentOrder = await this.getCategoryOrder();
        const newOrder = cleanupCategories(currentOrder, flows);
        if (newOrder) {
            await this.saveCategoryOrder(newOrder);
        }
    }

    public async setFlows(flows: Flow[]) {
        await this.store.write(flows);
        this.fireChange();
    }

    public async getCategoryOrder(): Promise<string[]> { return await this.categoryStore.read(); }

    public async saveCategoryOrder(order: string[]) {
        await this.categoryStore.write(order);
        this.fireChange();
    }
}
