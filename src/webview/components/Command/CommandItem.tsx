import React, { useState, useMemo } from 'react';
import { Command } from '../../types';
import { CommandInputs } from './CommandInputs';
import { CommandActions } from './CommandActions';

/**
 * Props for the CommandItem component.
 */
interface CommandItemProps {
    command: Command;
    isFirst: boolean;
    isLast: boolean;
    onRun: (id: string, interpolatedCommand?: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onExport?: (id: string) => void;
    onDuplicate: (command: Command) => void;
    onCopy: (id: string, interpolatedCommand?: string) => void;
}

/**
 * Renders a single command item in the list.
 * @param props The component props.
 * @returns The rendered CommandItem component.
 */
export const CommandItem: React.FC<CommandItemProps> = ({
    command, isFirst, isLast, onRun, onEdit, onDelete, onMove, onMoveUp, onMoveDown, onExport, onDuplicate, onCopy
}) => {
    const [inputs, setInputs] = useState<Record<string, string>>({});

    const variables = useMemo(() => {
        const regex = /\$([a-zA-Z0-9_]+)/g;
        const matches = [...command.command.matchAll(regex)];
        return Array.from(new Set(matches.map(m => m[1])));
    }, [command.command]);

    const handleInputChange = (variable: string, value: string) => {
        setInputs(prev => ({ ...prev, [variable]: value }));
    };

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
                <CommandInputs
                    variables={variables}
                    inputs={inputs}
                    onInputChange={handleInputChange}
                />
            </div>
            <CommandActions
                command={command}
                variables={variables}
                inputs={inputs}
                onRun={onRun}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                onExport={onExport}
                onDuplicate={onDuplicate}
                onCopy={onCopy}
            />
        </div>
    );
};
