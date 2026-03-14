import { BaseService } from './BaseService';

export interface Flow {
    id: string; title: string; description: string; category: string; sequence: string[]; runInNewTerminal?: boolean;
    source?: 'workspace' | 'user';
}

export class FlowService extends BaseService<Flow> {
    constructor(workspaceDir: string, userTerminalDir?: string) {
        super(workspaceDir, 'flows.json', 'flowCategories.json', userTerminalDir);
    }

    public getFlows() { return this.getItems(); }
    public saveFlow(flow: Flow) { return this.saveItem(flow); }
    public deleteFlow(id: string) { return this.deleteItem(id); }
    public moveFlow(id: string, target: 'workspace' | 'user') { return this.moveItem(id, target); }
    public setFlows(flows: Flow[]) { return this.setItems(flows); }
    public getFlowsByIds(ids: string[]) { return this.getItemsByIds(ids); }
    public importFlows(flows: Flow[]) { return this.importItems(flows); }

    public getDependentCommandIds(flows: Flow[]): string[] {
        const commandIds = new Set<string>();
        for (const flow of flows) {
            for (const step of flow.sequence) {
                if (!step.startsWith('__')) {
                    commandIds.add(step);
                }
            }
        }
        return Array.from(commandIds);
    }
}
