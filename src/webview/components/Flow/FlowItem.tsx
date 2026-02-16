import React, { useState } from 'react';
import { Flow, Command } from '../../types';
import { FlowStep } from './FlowStep';

interface FlowItemProps {
    flow: Flow;
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onRunCommand: (id: string) => void;
}

export const FlowItem: React.FC<FlowItemProps> = ({ flow, commands, onRun, onEdit, onDelete, onRunCommand }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flow-item-wrapper">
            <div className="flow-item">
                <div className="flow-info">
                    <div className="flow-header">
                        <span className="flow-title">{flow.title}</span>
                    </div>
                    <div className="flow-description">{flow.description}</div>
                </div>
                <div className="flow-right">
                    <div className="flow-actions">
                        <button title="Run" onClick={() => onRun(flow.id)}>▶</button>
                        <button title="Edit" onClick={() => onEdit(flow)}>✎</button>
                        <button title="Delete" onClick={() => onDelete(flow.id)}>🗑</button>
                    </div>
                    <span className="flow-badge">{flow.sequence.length} steps</span>
                </div>
            </div>
            <div className="flow-item-footer">
                <span className={`flow-detail-toggle ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '▾ Hide steps' : '▸ Show steps'}
                </span>
            </div>
            {isExpanded && flow.sequence.length > 0 && (
                <div className="flow-steps">
                    {flow.sequence.map((cmdId, index) => (
                        <FlowStep key={`${flow.id}-${index}`} cmdId={cmdId} index={index} command={commands.find(c => c.id === cmdId)} onRunCommand={onRunCommand} />
                    ))}
                </div>
            )}
        </div>
    );
};
