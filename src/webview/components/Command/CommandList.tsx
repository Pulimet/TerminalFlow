import React from 'react';
import { Command, Props } from '../../types';
import { CommandCategory } from './CommandCategory';
import { useCategoryState } from '../../hooks/useCategoryState';
import { ListActions } from '../ListActions';

const STORAGE_KEY = 'tf-cmd-categories';

export const CommandList: React.FC<Props> = ({ commands, onRun, onEdit, onDelete }) => {
    const groupedCommands = commands.reduce((acc, command) => {
        const category = command.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    const categories = Object.keys(groupedCommands);
    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(categories, STORAGE_KEY);

    return (
        <div className="command-list">
            <ListActions onExpandAll={expandAll} onCollapseAll={collapseAll} />
            {Object.entries(groupedCommands).map(([category, cmds]) => (
                <CommandCategory
                    key={category}
                    category={category}
                    commands={cmds}
                    isExpanded={expandedCategories[category] !== false}
                    onToggle={toggleCategory}
                    onRun={onRun}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
            {commands.length === 0 && <div className="empty-state">No commands found. Create one to get started.</div>}
        </div>
    );
};
