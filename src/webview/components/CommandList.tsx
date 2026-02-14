import React, { useState } from 'react';

// Using types defined in DataManager, but recreating here to avoid importing node modules in webview
interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

interface Props {
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}

export const CommandList: React.FC<Props> = ({ commands, onRun, onEdit, onDelete }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Group commands by category
    const groupedCommands = commands.reduce((acc, command) => {
        const category = command.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    return (
        <div className="command-list">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="category-group">
                    <div
                        className="category-header"
                        onClick={() => toggleCategory(category)}
                    >
                        <span className={`codicon codicon-chevron-${expandedCategories[category] ? 'down' : 'right'}`}></span>
                        <span className="category-title">{category}</span>
                    </div>
                    {expandedCategories[category] && (
                        <div className="category-items">
                            {cmds.map(cmd => (
                                <div key={cmd.id} className="command-item">
                                    <div className="command-info">
                                        <div className="command-header">
                                            <span className="command-title">{cmd.title}</span>
                                        </div>
                                        <div className="command-description">{cmd.description}</div>
                                        <div className="command-code">{cmd.command}</div>
                                    </div>
                                    <div className="command-actions">
                                        <button title="Run" onClick={() => onRun(cmd.id)}>▶</button>
                                        <button title="Edit" onClick={() => onEdit(cmd)}>✎</button>
                                        <button title="Delete" onClick={() => onDelete(cmd.id)}>🗑</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {commands.length === 0 && (
                <div className="empty-state">No commands found. Create one to get started.</div>
            )}
        </div>
    );
};
