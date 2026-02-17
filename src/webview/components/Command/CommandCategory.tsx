import React from 'react';
import { Command } from '../../types';
import { CommandItem } from './CommandItem';

interface CommandCategoryProps {
    category: string;
    commands: Command[];
    isExpanded: boolean;
    isFirst: boolean;
    isLast: boolean;
    onToggle: (category: string) => void;
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onMoveCategoryUp: (category: string) => void;
    onMoveCategoryDown: (category: string) => void;
    onMoveCommandUp: (id: string) => void;
    onMoveCommandDown: (id: string) => void;
}

export const CommandCategory: React.FC<CommandCategoryProps> = ({
    category, commands, isExpanded, isFirst, isLast, onToggle, onRun, onEdit, onDelete, onMove,
    onMoveCategoryUp, onMoveCategoryDown, onMoveCommandUp, onMoveCommandDown
}) => {
    return (
        <div className="category-group">
            <div className="category-header" onClick={() => onToggle(category)}>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="category-title">{category}</span>
                <span className="category-count">{commands.length}</span>
                <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="move-buttons" style={{ flexDirection: 'row', gap: '4px' }}>
                        <button disabled={isFirst} onClick={() => onMoveCategoryUp(category)} style={{ fontSize: '10px', height: 'auto', padding: '2px 4px' }}>▲</button>
                        <button disabled={isLast} onClick={() => onMoveCategoryDown(category)} style={{ fontSize: '10px', height: 'auto', padding: '2px 4px' }}>▼</button>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="category-items">
                    {commands.map((cmd, index) => (
                        <CommandItem
                            key={cmd.id}
                            command={cmd}
                            isFirst={index === 0}
                            isLast={index === commands.length - 1}
                            onRun={onRun}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMove={onMove}
                            onMoveUp={onMoveCommandUp}
                            onMoveDown={onMoveCommandDown}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
