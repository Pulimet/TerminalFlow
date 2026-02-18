import React from 'react';
import { Flow, Command } from '../../types';
import { FlowItem } from './FlowItem';

/**
 * Props for the FlowCategory component.
 */
interface FlowCategoryProps {
    category: string;
    flows: Flow[];
    commands: Command[];
    isExpanded: boolean;
    isFirst: boolean;
    isLast: boolean;
    onToggle: (category: string) => void;
    onRun: (id: string, fromIndex?: number) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onRunCommand: (id: string) => void;
    onMoveCategoryUp: (category: string) => void;
    onMoveCategoryDown: (category: string) => void;
    onMoveFlowUp: (id: string) => void;
    onMoveFlowDown: (id: string) => void;
    onExport?: (id: string) => void;
}

/**
 * Renders a category of flows with collapsible behavior.
 * @param props The component props.
 * @returns The rendered FlowCategory component.
 */
export const FlowCategory: React.FC<FlowCategoryProps> = ({
    category, flows, commands, isExpanded, isFirst, isLast, onToggle, onRun, onEdit, onDelete, onMove, onRunCommand,
    onMoveCategoryUp, onMoveCategoryDown, onMoveFlowUp, onMoveFlowDown, onExport
}) => {
    return (
        <div className="category-group">
            <div className="category-header" onClick={() => onToggle(category)}>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="category-title">{category}</span>
                <span className="category-count">{flows.length}</span>
                <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="move-buttons" style={{ flexDirection: 'row', gap: '4px' }}>
                        <button disabled={isFirst} onClick={() => onMoveCategoryUp(category)} style={{ fontSize: '10px', height: 'auto', padding: '2px 4px' }}>▲</button>
                        <button disabled={isLast} onClick={() => onMoveCategoryDown(category)} style={{ fontSize: '10px', height: 'auto', padding: '2px 4px' }}>▼</button>
                    </div>
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
                            onMove={onMove}
                            onRunCommand={onRunCommand}
                            onMoveUp={onMoveFlowUp}
                            onMoveDown={onMoveFlowDown}
                            onExport={onExport}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
