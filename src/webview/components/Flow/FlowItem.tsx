import React, { useState } from 'react';
import { Flow, Command } from '../../types';
import { FlowStep } from './FlowStep';

interface FlowItemProps {
    flow: Flow; commands: Command[]; isFirst: boolean; isLast: boolean;
    onRun: (id: string, fromIndex?: number) => void;
    onEdit: (flow: Flow) => void; onDelete: (id: string) => void;
    onMove: (id: string) => void; onRunCommand: (id: string) => void;
    onMoveUp: (id: string) => void; onMoveDown: (id: string) => void;
    onExport?: (id: string) => void; onDuplicate: (item: Flow) => void;
    onCopy: (text: string) => void;
}

const getFlowScript = (flow: Flow, commands: Command[]) => flow.sequence.map(cmdId => {
    if (cmdId.startsWith('__sleep:')) {
        const ms = parseInt(cmdId.replace('__sleep:', ''), 10);
        return !isNaN(ms) && ms > 0 ? `echo "Sleeping ${ms}ms..." && sleep ${ms / 1000}` : '';
    }
    if (cmdId.startsWith('__echo:')) return `echo "${cmdId.replace('__echo:', '')}"`;
    return commands.find(c => c.id === cmdId)?.command || '';
}).filter(Boolean).join(' && ');

export const FlowItem: React.FC<FlowItemProps> = (props) => {
    const { flow, commands, isFirst, isLast, onRun, onEdit, onDelete, onMove, onRunCommand, onMoveUp, onMoveDown, onExport, onDuplicate, onCopy } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopyFlow = (e: React.MouseEvent) => {
        e.stopPropagation();
        const script = getFlowScript(flow, commands);
        if (script) onCopy(script);
    };

    return (
        <div className="flow-item-wrapper">
            <div className="flow-item">
                <div className="move-left">
                    <div className="move-buttons">
                        <button disabled={isFirst} onClick={() => onMoveUp(flow.id)}>▲</button>
                        <button disabled={isLast} onClick={() => onMoveDown(flow.id)}>▼</button>
                    </div>
                </div>
                <div className="flow-info">
                    <div className="flow-header"><span className="flow-title">{flow.title}</span></div>
                    <div className="flow-description">{flow.description}</div>
                </div>
                <div className="flow-right">
                    <div className="flow-actions">
                        <div className="action-row">
                            <button title="Duplicate" onClick={() => onDuplicate(flow)}>⧉</button>
                            <button title="Edit" onClick={() => onEdit(flow)}>✎</button>
                            {onExport && <button title="Export" onClick={() => onExport(flow.id)}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M9 1h4v4M13 1L7 7M11 13H3V5h6" /></svg></button>}
                            <button title="Run" onClick={() => onRun(flow.id)}>▶</button>
                        </div>
                        <div className="action-row">
                            <button title="Transfer" onClick={() => onMove(flow.id)}>⇄</button>
                            <button title="Copy Flow Script" onClick={handleCopyFlow}>📋</button>
                            <button title="Delete" onClick={() => onDelete(flow.id)}>🗑</button>
                        </div>
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
                        <FlowStep key={`${flow.id}-${index}`} cmdId={cmdId} index={index} command={commands.find(c => c.id === cmdId)}
                            onRunCommand={onRunCommand} onRunFlowFromHere={(idx) => onRun(flow.id, idx)} onCopy={onCopy} />
                    ))}
                </div>
            )}
        </div>
    );
};
