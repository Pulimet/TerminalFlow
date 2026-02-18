import { useState, useEffect } from 'react';

/**
 * Custom hook for managing the expanded/collapsed state of categories.
 * @param categories The list of category names.
 * @param storageKey The key used for local storage persistence.
 * @returns An object containing the state and toggle functions.
 */
export const useCategoryState = (categories: string[], storageKey: string) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    });

    useEffect(() => {
        setExpandedCategories(prev => {
            const updated = { ...prev };
            categories.forEach(cat => {
                if (updated[cat] === undefined) updated[cat] = true;
            });
            return updated;
        });
    }, [categories.join(',')]); // Depend on the stringified categories to avoid ref issues

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = { ...prev, [category]: !prev[category] };
            localStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    };

    const expandAll = () => {
        const next = categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
        setExpandedCategories(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    const collapseAll = () => {
        const next = categories.reduce((acc, cat) => ({ ...acc, [cat]: false }), {});
        setExpandedCategories(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    return {
        expandedCategories,
        toggleCategory,
        expandAll,
        collapseAll
    };
};
