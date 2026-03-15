import React from 'react';
import { Command } from '../../types';

/**
 * Props for the CommandActions component.
 */
interface CommandActionsProps {
    command: Command;
    variables: string[];
    inputs: Record<string, string>;
    onRun: (id: string, interpolatedCommand?: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onExport?: (id: string) => void;
    onDuplicate: (command: Command) => void;
    onCopy: (id: string, interpolatedCommand?: string) => void;
}

/**
 * Renders the actions for a single command item.
 * @param props The component props.
 * @returns The rendered CommandActions component.
 */
export const CommandActions: React.FC<CommandActionsProps> = ({
    command, variables, inputs, onRun, onEdit, onDelete, onMove, onExport, onDuplicate, onCopy
}) => {
    const getInterpolatedCommand = () => {
        let result = command.command;
        variables.forEach(v => {
            const value = inputs[v] || '';
            result = result.replace(new RegExp(`\\$${v}(?!\\w)`, 'g'), value);
        });
        return result;
    };

    const handleRun = () => {
        onRun(command.id, variables.length ? getInterpolatedCommand() : undefined);
    };

    const handleCopy = () => {
        onCopy(command.id, variables.length ? getInterpolatedCommand() : undefined);
    };

    return (
        <div className="command-actions">
            <div className="action-row">
                <button title="Duplicate" onClick={() => onDuplicate(command)}>⧉</button>
                <button title="Edit" onClick={() => onEdit(command)}>✎</button>
                {onExport && (
                    <button title="Export" onClick={() => onExport(command.id)}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <path d="M9 1h4v4M13 1L7 7M11 13H3V5h6" />
                        </svg>
                    </button>
                )}
                <button title="Run" onClick={handleRun}>▶</button>
            </div>
            <div className="action-row">
                <button title="Transfer" onClick={() => onMove(command.id)}>⇄</button>
                <button title="Copy" onClick={handleCopy}>📋</button>
                <button title="Delete" onClick={() => onDelete(command.id)}>🗑</button>
            </div>
        </div>
    );
};
