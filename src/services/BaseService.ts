import { Store } from '../utils/Store';
import { cleanupCategories } from '../utils/categoryUtils';

export interface BaseItem { id: string; category?: string; source?: 'workspace' | 'user'; [key: string]: any; }

export class BaseService<T extends BaseItem> {
    protected wsStore: Store<T[]>; protected userStore?: Store<T[]>;
    protected wsCatStore: Store<string[]>; protected userCatStore?: Store<string[]>;
    protected listeners = new Set<() => void>();

    constructor(wsDir: string, dataFile: string, catFile: string, userDir?: string) {
        this.wsStore = new Store<T[]>(wsDir, dataFile, []); this.wsCatStore = new Store<string[]>(wsDir, catFile, []);
        if (userDir) { this.userStore = new Store<T[]>(userDir, dataFile, []); this.userCatStore = new Store<string[]>(userDir, catFile, []); }
    }

    public onDidChange(cb: () => void) { this.listeners.add(cb); }
    public fireChange() { this.listeners.forEach(cb => cb()); }

    public async getItems(): Promise<T[]> {
        const wsItems = (await this.wsStore.read()).map(i => ({ ...i, source: 'workspace' as const }));
        const uItems = this.userStore ? (await this.userStore.read()).map(i => ({ ...i, source: 'user' as const })) : [];
        return [...wsItems, ...uItems] as T[];
    }

    public async saveItem(item: T) {
        const store = item.source === 'user' && this.userStore ? this.userStore : this.wsStore;
        const items = await store.read();
        const idx = items.findIndex(i => i.id === item.id);
        if (idx !== -1) items[idx] = item; else items.push(item);
        await store.write(items); await this.cleanup(items, item.source === 'user'); this.fireChange();
    }

    public async deleteItem(id: string) {
        const item = (await this.getItems()).find(i => i.id === id);
        if (!item) return;
        const store = item.source === 'user' && this.userStore ? this.userStore : this.wsStore;
        const items = (await store.read()).filter(i => i.id !== id);
        await store.write(items); await this.cleanup(items, item.source === 'user'); this.fireChange();
    }

    public async moveItem(id: string, target: 'workspace' | 'user') {
        const item = (await this.getItems()).find(i => i.id === id);
        if (!item || item.source === target) return;
        await this.deleteItem(id); await this.saveItem({ ...item, source: target } as T);
    }

    private async cleanup(items: T[], isUser: boolean) {
        const store = isUser && this.userCatStore ? this.userCatStore : this.wsCatStore;
        const order = cleanupCategories(await store.read(), items);
        if (order) await store.write(order);
    }

    public async setItems(items: T[]) {
        await this.wsStore.write(items.filter(i => i.source !== 'user'));
        if (this.userStore) await this.userStore.write(items.filter(i => i.source === 'user'));
        this.fireChange();
    }

    public async getCategoryOrder(scope: 'workspace' | 'user' = 'workspace'): Promise<string[]> {
        return (scope === 'user' && this.userCatStore) ? await this.userCatStore.read() : await this.wsCatStore.read();
    }

    public async saveCategoryOrder(order: string[], scope: 'workspace' | 'user' = 'workspace') {
        const isUser = scope === 'user' && this.userCatStore && this.userStore;
        const cats = new Set((await (isUser ? this.userStore! : this.wsStore).read()).map(i => i.category || 'Uncategorized'));
        await (isUser ? this.userCatStore! : this.wsCatStore).write(order.filter(c => cats.has(c)));
        this.fireChange();
    }

    public async getItemsByIds(ids: string[]): Promise<T[]> { return (await this.getItems()).filter(i => ids.includes(i.id)); }

    public async importItems(items: T[]) {
        const doImport = async (store: Store<T[]>, toImport: T[], isUser: boolean) => {
            if (!toImport.length) return;
            const current = await store.read();
            for (const item of toImport) {
                const idx = current.findIndex(i => i.id === item.id);
                if (idx !== -1) current[idx] = item; else current.push(item);
            }
            await store.write(current); await this.cleanup(current, isUser);
        };
        await doImport(this.wsStore, items.filter(i => i.source !== 'user'), false);
        if (this.userStore) await doImport(this.userStore, items.filter(i => i.source === 'user'), true);
        this.fireChange();
    }
}
