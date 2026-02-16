import React from 'react';
import { Command } from '../../types';
import { CommandItem } from './CommandItem';

interface CommandCategoryProps {
    category: string;
    commands: Command[];
    isExpanded: boolean;
    onToggle: (category: string) => void;
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}

export const CommandCategory: React.FC<CommandCategoryProps> = ({
    category, commands, isExpanded, onToggle, onRun, onEdit, onDelete
}) => {
    return (
        <div className="category-group">
            <div className="category-header" onClick={() => onToggle(category)}>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="category-title">{category}</span>
                <span className="category-count">{commands.length}</span>
            </div>
            {isExpanded && (
                <div className="category-items">
                    {commands.map(cmd => (
                        <CommandItem
                            key={cmd.id}
                            command={cmd}
                            onRun={onRun}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
