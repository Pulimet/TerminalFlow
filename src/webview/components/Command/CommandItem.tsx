import React from 'react';
import { Command } from '../../types';

/**
 * Props for the CommandItem component.
 */
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
    onExport?: (id: string) => void;
}

/**
 * Renders a single command item in the list.
 * @param props The component props.
 * @returns The rendered CommandItem component.
 */
export const CommandItem: React.FC<CommandItemProps> = ({
    command, isFirst, isLast, onRun, onEdit, onDelete, onMove, onMoveUp, onMoveDown, onExport
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
                <div className="action-row">
                    <button title="Edit" onClick={() => onEdit(command)}>✎</button>
                    {onExport && (
                        <button title="Export" onClick={() => onExport(command.id)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                                <path d="M9 1h4v4M13 1L7 7M11 13H3V5h6" />
                            </svg>
                        </button>
                    )}
                    <button title="Run" onClick={() => onRun(command.id)}>▶</button>
                </div>
                <div className="action-row">
                    <button title="Transfer" onClick={() => onMove(command.id)}>⇄</button>
                    <button title="Delete" onClick={() => onDelete(command.id)}>🗑</button>
                </div>
            </div>
        </div>
    );
};
