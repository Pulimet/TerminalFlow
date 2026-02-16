import React from 'react';
import { Command } from '../../types';

interface CommandItemProps {
    command: Command;
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
}

export const CommandItem: React.FC<CommandItemProps> = ({ command, onRun, onEdit, onDelete }) => {
    return (
        <div className="command-item">
            <div className="command-info">
                <div className="command-header">
                    <span className="command-title">{command.title}</span>
                </div>
                <div className="command-description">{command.description}</div>
                <div className="command-code">{command.command}</div>
            </div>
            <div className="command-actions">
                <button title="Run" onClick={() => onRun(command.id)}>▶</button>
                <button title="Edit" onClick={() => onEdit(command)}>✎</button>
                <button title="Delete" onClick={() => onDelete(command.id)}>🗑</button>
            </div>
        </div>
    );
};
