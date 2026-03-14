import { useState, useMemo } from 'react';
import { useCategoryState } from './useCategoryState';

/**
 * Base interface for items in the list.
 */
interface BaseItem {
    id: string;
    category?: string;
}

/**
 * Props for the useListLogic hook.
 */
interface UseListLogicProps<T extends BaseItem> {
    items: T[];
    categoryOrder: string[];
    storageKey: string;
    filterCallback: (item: T, query: string) => boolean;
    onReorderItems: (items: T[]) => void;
    onReorderCategories: (order: string[]) => void;
}

/**
 * Custom hook containing shared logic for lists (filtering, grouping, reordering).
 * @template T The type of item in the list.
 * @param props The hook props.
 * @returns An object containing the logic and state for the list.
 */
export const useListLogic = <T extends BaseItem>({
    items,
    categoryOrder,
    storageKey,
    filterCallback,
    onReorderItems,
    onReorderCategories
}: UseListLogicProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item => filterCallback(item, query));
    }, [items, searchQuery, filterCallback]);

    const groupedItems = filteredItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, T[]>);

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(sortedCategories, storageKey);

    const ensureCategoriesInOrder = () => {
        const newOrder = [...categoryOrder];
        sortedCategories.forEach(c => {
            if (!newOrder.includes(c)) newOrder.push(c);
        });
        return newOrder;
    };

    const handleMoveCategoryUp = (category: string) => {
        const idx = sortedCategories.indexOf(category);
        if (idx <= 0) return;
        const prevCategory = sortedCategories[idx - 1];
        
        const newOrder = ensureCategoriesInOrder();
        const idx1 = newOrder.indexOf(category);
        const idx2 = newOrder.indexOf(prevCategory);
        
        [newOrder[idx1], newOrder[idx2]] = [newOrder[idx2], newOrder[idx1]];
        onReorderCategories(newOrder);
    };

    const handleMoveCategoryDown = (category: string) => {
        const idx = sortedCategories.indexOf(category);
        if (idx === -1 || idx === sortedCategories.length - 1) return;
        const nextCategory = sortedCategories[idx + 1];

        const newOrder = ensureCategoriesInOrder();
        const idx1 = newOrder.indexOf(category);
        const idx2 = newOrder.indexOf(nextCategory);
        
        [newOrder[idx1], newOrder[idx2]] = [newOrder[idx2], newOrder[idx1]];
        onReorderCategories(newOrder);
    };

    const handleMoveItemUp = (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        const cat = item.category || 'Uncategorized';
        const catItems = groupedItems[cat];
        const indexInCat = catItems.findIndex(i => i.id === id);
        if (indexInCat <= 0) return;

        const prevItem = catItems[indexInCat - 1];
        const index1 = items.findIndex(i => i.id === id);
        const index2 = items.findIndex(i => i.id === prevItem.id);

        const newItems = [...items];
        [newItems[index1], newItems[index2]] = [newItems[index2], newItems[index1]];
        onReorderItems(newItems);
    };

    const handleMoveItemDown = (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        const cat = item.category || 'Uncategorized';
        const catItems = groupedItems[cat];
        const indexInCat = catItems.findIndex(i => i.id === id);
        if (indexInCat === -1 || indexInCat === catItems.length - 1) return;

        const nextItem = catItems[indexInCat + 1];
        const index1 = items.findIndex(i => i.id === id);
        const index2 = items.findIndex(i => i.id === nextItem.id);

        const newItems = [...items];
        [newItems[index1], newItems[index2]] = [newItems[index2], newItems[index1]];
        onReorderItems(newItems);
    };

    return {
        searchQuery,
        setSearchQuery,
        groupedItems,
        sortedCategories,
        expandedCategories,
        toggleCategory,
        expandAll,
        collapseAll,
        moveCategoryUp: handleMoveCategoryUp,
        moveCategoryDown: handleMoveCategoryDown,
        moveItemUp: handleMoveItemUp,
        moveItemDown: handleMoveItemDown,
        filteredItems
    };
};
