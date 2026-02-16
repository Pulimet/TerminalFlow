import React, { useState, useEffect } from 'react';
import { Command, Props } from '../../types';
import { CommandCategory } from './CommandCategory';

const STORAGE_KEY = 'tf-cmd-categories';

export const CommandList: React.FC<Props> = ({ commands, onRun, onEdit, onDelete }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    });

    useEffect(() => {
        setExpandedCategories(prev => {
            const updated = { ...prev };
            commands.forEach(cmd => {
                const cat = cmd.category || 'Uncategorized';
                if (updated[cat] === undefined) updated[cat] = true;
            });
            return updated;
        });
    }, [commands]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = { ...prev, [category]: !prev[category] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const groupedCommands = commands.reduce((acc, command) => {
        const category = command.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    return (
        <div className="command-list">
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
