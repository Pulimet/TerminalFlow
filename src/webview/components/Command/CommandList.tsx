import React from 'react';
import { Command, Props } from '../../types';
import { CommandCategory } from './CommandCategory';
import { useCategoryState } from '../../hooks/useCategoryState';
import { ListActions } from '../ListActions';

const STORAGE_KEY = 'tf-cmd-categories';

export const CommandList: React.FC<Props> = ({ commands, onRun, onEdit, onDelete }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredCommands = React.useMemo(() => {
        if (!searchQuery.trim()) return commands;
        const query = searchQuery.toLowerCase();
        return commands.filter(cmd =>
            cmd.title.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query) ||
            cmd.command.toLowerCase().includes(query)
        );
    }, [commands, searchQuery]);

    const groupedCommands = filteredCommands.reduce((acc, command) => {
        const category = command.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    const categories = Object.keys(groupedCommands);
    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(categories, STORAGE_KEY);

    return (
        <div className="command-list">
            <ListActions
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />
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
            {filteredCommands.length === 0 && (
                <div className="empty-state">
                    {searchQuery ? 'No commands match your search.' : 'No commands found. Create one to get started.'}
                </div>
            )}
        </div>
    );
};
