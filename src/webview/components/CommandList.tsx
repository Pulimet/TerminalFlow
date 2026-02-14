import React, { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'tf-cmd-categories';

function loadCategoryState(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCategoryState(state: Record<string, boolean>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const CommandList: React.FC<Props> = ({ commands, onRun, onEdit, onDelete }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        const saved = loadCategoryState();
        // Default to expanded for any category not previously saved
        const categories = [...new Set(commands.map(c => c.category || 'Uncategorized'))];
        const merged: Record<string, boolean> = {};
        categories.forEach(cat => {
            merged[cat] = saved[cat] !== undefined ? saved[cat] : true;
        });
        return merged;
    });

    // When commands change (new categories may appear), ensure new categories default to expanded
    useEffect(() => {
        setExpandedCategories(prev => {
            const updated = { ...prev };
            commands.forEach(cmd => {
                const cat = cmd.category || 'Uncategorized';
                if (updated[cat] === undefined) {
                    updated[cat] = true;
                }
            });
            return updated;
        });
    }, [commands]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = { ...prev, [category]: !prev[category] };
            saveCategoryState(next);
            return next;
        });
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
            {Object.entries(groupedCommands).map(([category, cmds]) => {
                const isExpanded = expandedCategories[category] !== false;
                return (
                    <div key={category} className="category-group">
                        <div
                            className="category-header"
                            onClick={() => toggleCategory(category)}
                        >
                            <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                            <span className="category-title">{category}</span>
                            <span className="category-count">{cmds.length}</span>
                        </div>
                        {isExpanded && (
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
                );
            })}
            {commands.length === 0 && (
                <div className="empty-state">No commands found. Create one to get started.</div>
            )}
        </div>
    );
};
