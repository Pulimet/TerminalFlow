import React from 'react';
import { Command } from '../../types';
import { CommandCategory } from './CommandCategory';
import { useListLogic } from '../../hooks/useListLogic';
import { ListActions } from '../ListActions';

/**
 * Props for the CommandList component.
 */
interface Props {
    commands: Command[];
    categoryOrder?: string[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onReorderCommands: (commands: Command[]) => void;
    onReorderCategories: (order: string[]) => void;
}

const STORAGE_KEY = 'tf-cmd-categories';

/**
 * Renders a list of commands grouped by category.
 * @param props The component props.
 * @returns The rendered CommandList component.
 */
export const CommandList: React.FC<Props> = ({
    commands, categoryOrder = [], onRun, onEdit, onDelete, onMove, onReorderCommands, onReorderCategories
}) => {
    const {
        searchQuery,
        setSearchQuery,
        groupedItems: groupedCommands,
        sortedCategories: categories,
        expandedCategories,
        toggleCategory,
        expandAll,
        collapseAll,
        moveCategoryUp,
        moveCategoryDown,
        moveItemUp,
        moveItemDown,
        filteredItems: filteredCommands
    } = useListLogic({
        items: commands,
        categoryOrder,
        storageKey: STORAGE_KEY,
        filterCallback: (cmd, query) =>
            cmd.title.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query) ||
            cmd.command.toLowerCase().includes(query),
        onReorderItems: onReorderCommands,
        onReorderCategories: onReorderCategories
    });

    return (
        <div className="command-list">
            <ListActions
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />
            {categories.map((category, index) => (
                <CommandCategory
                    key={category}
                    category={category}
                    commands={groupedCommands[category]}
                    isExpanded={expandedCategories[category] !== false}
                    isFirst={index === 0}
                    isLast={index === categories.length - 1}
                    onToggle={toggleCategory}
                    onRun={onRun}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                    onMoveCategoryUp={moveCategoryUp}
                    onMoveCategoryDown={moveCategoryDown}
                    onMoveCommandUp={moveItemUp}
                    onMoveCommandDown={moveItemDown}
                />
            ))}
            {filteredCommands.length === 0 && (
                <div className="empty-state">
                    {searchQuery ? 'No commands match your search.' : 'No commands found. Create one to get started.'}
                </div>
            )}
        </div>
    );
};
