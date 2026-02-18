import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[]; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

/**
 * Service for managing flows.
 */
export class FlowService {
    private workspaceStore: Store<Flow[]>;
    private userStore: Store<Flow[]> | undefined;
    private workspaceCategoryStore: Store<string[]>;
    private userCategoryStore: Store<string[]> | undefined;
    private _onDidChange = new Set<() => void>();

    /**
     * Creates an instance of FlowService.
     * @param workspaceDir The directory for workspace-specific storage.
     * @param userTerminalDir Optional directory for user-specific storage.
     */
    constructor(workspaceDir: string, userTerminalDir?: string) {
        this.workspaceStore = new Store<Flow[]>(workspaceDir, 'flows.json', []);
        this.workspaceCategoryStore = new Store<string[]>(workspaceDir, 'flowCategories.json', []);

        if (userTerminalDir) {
            this.userStore = new Store<Flow[]>(userTerminalDir, 'flows.json', []);
            this.userCategoryStore = new Store<string[]>(userTerminalDir, 'flowCategories.json', []);
        }
    }

    /**
     * Registers a callback to be invoked when flows change.
     * @param callback The callback function.
     */
    public onDidChange(callback: () => void) { this._onDidChange.add(callback); }

    /**
     * Triggers the change event listeners.
     */
    public fireChange() { this._onDidChange.forEach(cb => cb()); }

    /**
     * Retrieves all flows from both workspace and user stores.
     * @returns A promise resolving to an array of flows.
     */
    public async getFlows(): Promise<Flow[]> {
        const workspaceFlows = (await this.workspaceStore.read()).map(f => ({ ...f, source: 'workspace' as const }));
        const userFlows = this.userStore ? (await this.userStore.read()).map(f => ({ ...f, source: 'user' as const })) : [];
        return [...workspaceFlows, ...userFlows];
    }

    /**
     * Saves a flow to the appropriate store based on its source.
     * @param flow The flow to save.
     */
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

    /**
     * Deletes a flow by its ID.
     * @param id The ID of the flow to delete.
     */
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

    /**
     * Moves a flow from one source (workspace/user) to another.
     * @param id The ID of the flow to move.
     * @param targetSource The target source ('workspace' or 'user').
     */
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

    /**
     * Cleans up unused categories from the store.
     * @param flows The list of current flows.
     * @param isUser Whether to check the user store or workspace store.
     */
    private async performCategoryCleanup(flows: Flow[], isUser: boolean) {
        const store = isUser && this.userCategoryStore ? this.userCategoryStore : this.workspaceCategoryStore;
        const currentOrder = await store.read();
        const newOrder = cleanupCategories(currentOrder, flows);
        if (newOrder) {
            await store.write(newOrder);
        }
    }

    /**
     * Overwrites the flows logic.
     * @param flows The new list of flows.
     */
    public async setFlows(flows: Flow[]) {
        const workspaceFlows = flows.filter(f => f.source !== 'user');
        const userFlows = flows.filter(f => f.source === 'user');

        await this.workspaceStore.write(workspaceFlows);
        if (this.userStore) {
            await this.userStore.write(userFlows);
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

    /**
     * Retrieves specific flows by their IDs.
     * @param ids The list of flow IDs to retrieve.
     * @returns A promise resolving to the found flows.
     */
    public async getFlowsByIds(ids: string[]): Promise<Flow[]> {
        const allFlows = await this.getFlows();
        return allFlows.filter(f => ids.includes(f.id));
    }

    /**
     * Extracts all unique command IDs referenced by the given flows.
     * @param flows The list of flows to analyze.
     * @returns A list of unique command IDs.
     */
    public getDependentCommandIds(flows: Flow[]): string[] {
        const commandIds = new Set<string>();
        for (const flow of flows) {
            for (const step of flow.sequence) {
                if (!step.startsWith('__')) { // Ignore special commands like __echo, __sleep
                    commandIds.add(step);
                }
            }
        }
        return Array.from(commandIds);
    }

    /**
     * Imports a list of flows, overwriting existing ones with the same ID.
     * @param flows The flows to import.
     */
    public async importFlows(flows: Flow[]) {
        const workspaceFlowsToImport = flows.filter(f => f.source !== 'user');
        const userFlowsToImport = flows.filter(f => f.source === 'user');

        if (workspaceFlowsToImport.length > 0) {
            const currentWorkspaceFlows = await this.workspaceStore.read();
            for (const flow of workspaceFlowsToImport) {
                const index = currentWorkspaceFlows.findIndex(f => f.id === flow.id);
                if (index !== -1) currentWorkspaceFlows[index] = flow;
                else currentWorkspaceFlows.push(flow);
            }
            await this.workspaceStore.write(currentWorkspaceFlows);
            await this.performCategoryCleanup(currentWorkspaceFlows, false);
        }

        if (userFlowsToImport.length > 0 && this.userStore) {
            const currentUserFlows = await this.userStore.read();
            for (const flow of userFlowsToImport) {
                const index = currentUserFlows.findIndex(f => f.id === flow.id);
                if (index !== -1) currentUserFlows[index] = flow;
                else currentUserFlows.push(flow);
            }
            await this.userStore.write(currentUserFlows);
            await this.performCategoryCleanup(currentUserFlows, true);
        }

        this.fireChange();
    }
}
