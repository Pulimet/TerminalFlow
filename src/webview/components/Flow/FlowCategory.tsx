import React from 'react';
import { Flow, Command } from '../../types';
import { FlowItem } from './FlowItem';

interface FlowCategoryProps {
    category: string;
    flows: Flow[];
    commands: Command[];
    isExpanded: boolean;
    onToggle: (category: string) => void;
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onRunCommand: (id: string) => void;
}

export const FlowCategory: React.FC<FlowCategoryProps> = ({
    category, flows, commands, isExpanded, onToggle, onRun, onEdit, onDelete, onRunCommand
}) => {
    return (
        <div className="category-group">
            <div className="category-header" onClick={() => onToggle(category)}>
                <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="category-title">{category}</span>
                <span className="category-count">{flows.length}</span>
            </div>
            {isExpanded && (
                <div className="category-items">
                    {flows.map(flow => (
                        <FlowItem
                            key={flow.id}
                            flow={flow}
                            commands={commands}
                            onRun={onRun}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onRunCommand={onRunCommand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
