import { useState, useMemo } from 'react';
import { useCategoryState } from './useCategoryState';

interface BaseItem { id: string; category?: string; }

interface UseListLogicProps<T extends BaseItem> {
    items: T[]; categoryOrder: string[]; storageKey: string;
    filterCallback: (item: T, query: string) => boolean;
    onReorderItems: (items: T[]) => void; onReorderCategories: (order: string[]) => void;
}

export const useListLogic = <T extends BaseItem>(props: UseListLogicProps<T>) => {
    const { items, categoryOrder, storageKey, filterCallback, onReorderItems, onReorderCategories } = props;
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(i => filterCallback(i, query));
    }, [items, searchQuery, filterCallback]);

    const groupedItems = filteredItems.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, T[]>);

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const iA = categoryOrder.indexOf(a), iB = categoryOrder.indexOf(b);
        if (iA === -1 && iB === -1) return a.localeCompare(b);
        if (iA === -1) return 1; if (iB === -1) return -1;
        return iA - iB;
    });

    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(sortedCategories, storageKey);

    const ensureCatOrder = () => {
        const newOrder = [...categoryOrder];
        sortedCategories.forEach(c => { if (!newOrder.includes(c)) newOrder.push(c); });
        return newOrder;
    };

    const moveCat = (cat: string, up: boolean) => {
        const idx = sortedCategories.indexOf(cat);
        if (idx === -1 || (up && idx <= 0) || (!up && idx >= sortedCategories.length - 1)) return;
        const newOrder = ensureCatOrder();
        const target = sortedCategories[up ? idx - 1 : idx + 1];
        const i1 = newOrder.indexOf(cat), i2 = newOrder.indexOf(target);
        [newOrder[i1], newOrder[i2]] = [newOrder[i2], newOrder[i1]];
        onReorderCategories(newOrder);
    };

    const moveItem = (id: string, up: boolean) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        const catItems = groupedItems[item.category || 'Uncategorized'];
        const idx = catItems.findIndex(i => i.id === id);
        if (idx === -1 || (up && idx <= 0) || (!up && idx >= catItems.length - 1)) return;
        const target = catItems[up ? idx - 1 : idx + 1];
        const i1 = items.findIndex(i => i.id === id), i2 = items.findIndex(i => i.id === target.id);
        const newItems = [...items];
        [newItems[i1], newItems[i2]] = [newItems[i2], newItems[i1]];
        onReorderItems(newItems);
    };

    return {
        searchQuery, setSearchQuery, groupedItems, sortedCategories, expandedCategories, toggleCategory,
        expandAll, collapseAll, moveCategoryUp: (c: string) => moveCat(c, true), moveCategoryDown: (c: string) => moveCat(c, false),
        moveItemUp: (id: string) => moveItem(id, true), moveItemDown: (id: string) => moveItem(id, false), filteredItems
    };
};
