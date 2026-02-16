import { Store } from '../utils/Store';

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[];
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
        this.fireChange();
    }

    public async deleteFlow(id: string) {
        const flows = await this.getFlows();
        await this.store.write(flows.filter(f => f.id !== id));
        this.fireChange();
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
