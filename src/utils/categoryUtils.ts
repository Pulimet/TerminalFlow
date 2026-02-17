/**
 * Filters out categories that are no longer present in the items list.
 * @param currentOrder The current list of ordered categories.
 * @param items The list of items (commands or flows) that have a category property.
 * @returns A new array of categories if changes are needed, or null if the order is unchanged.
 */
export function cleanupCategories(currentOrder: string[], items: { category: string }[]): string[] | null {
    const existingCategories = new Set(items.map(i => i.category));
    const newOrder = currentOrder.filter(c => existingCategories.has(c));

    if (newOrder.length !== currentOrder.length) {
        return newOrder;
    }
    return null;
}
