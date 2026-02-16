import React from 'react';
import { Flow, Command } from '../../types';
import { FlowItem } from './FlowItem';

interface FlowCategoryProps {
    category: string;
    flows: Flow[];
    commands: Command[];
    isExpanded: boolean;
    isFirst: boolean;
    isLast: boolean;
    onToggle: (category: string) => void;
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onRunCommand: (id: string) => void;
    onMoveCategoryUp: (category: string) => void;
    onMoveCategoryDown: (category: string) => void;
    onMoveFlowUp: (id: string) => void;
    onMoveFlowDown: (id: string) => void;
}

export const FlowCategory: React.FC<FlowCategoryProps> = ({
    category, flows, commands, isExpanded, isFirst, isLast, onToggle, onRun, onEdit, onDelete, onRunCommand,
    onMoveCategoryUp, onMoveCategoryDown, onMoveFlowUp, onMoveFlowDown
}) => {
    return (
        <div className="category-group">
            <div className="category-header" onClick={() => onToggle(category)}>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="category-title">{category}</span>
                <span className="category-count">{flows.length}</span>
                <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                    <button disabled={isFirst} onClick={() => onMoveCategoryUp(category)}>▲</button>
                    <button disabled={isLast} onClick={() => onMoveCategoryDown(category)}>▼</button>
                </div>
            </div>
            {isExpanded && (
                <div className="category-items">
                    {flows.map((flow, index) => (
                        <FlowItem
                            key={flow.id}
                            flow={flow}
                            commands={commands}
                            isFirst={index === 0}
                            isLast={index === flows.length - 1}
                            onRun={onRun}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onRunCommand={onRunCommand}
                            onMoveUp={onMoveFlowUp}
                            onMoveDown={onMoveFlowDown}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
