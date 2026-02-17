import React from 'react';
import { Command } from '../../types';

interface CommandItemProps {
    command: Command;
    isFirst: boolean;
    isLast: boolean;
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

export const CommandItem: React.FC<CommandItemProps> = ({
    command, isFirst, isLast, onRun, onEdit, onDelete, onMove, onMoveUp, onMoveDown
}) => {
    return (
        <div className="command-item">
            <div className="move-left">
                <div className="move-buttons">
                    <button disabled={isFirst} onClick={() => onMoveUp(command.id)}>▲</button>
                    <button disabled={isLast} onClick={() => onMoveDown(command.id)}>▼</button>
                </div>
            </div>
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
                <button title="Transfer" onClick={() => onMove(command.id)}>⇄</button>
                <button title="Delete" onClick={() => onDelete(command.id)}>🗑</button>
            </div>
        </div>
    );
};
