import React from 'react';
import { Command } from '../../types';

interface SequenceBuilderProps {
    sequence: string[];
    availableCommands: Command[];
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemove: (index: number) => void;
}

export const SequenceBuilder: React.FC<SequenceBuilderProps> = ({ sequence, availableCommands, onMoveUp, onMoveDown, onRemove }) => {
    const getEntryLabel = (id: string): string => {
        if (id.startsWith('__sleep:')) return `⏱ Sleep ${id.replace('__sleep:', '')}ms`;
        if (id.startsWith('__echo:')) return `💬 Echo: ${id.replace('__echo:', '')}`;
        return availableCommands.find(c => c.id === id)?.title || 'Unknown Command';
    };

    return (
        <div className="sequence-builder">
            <h4>Sequence</h4>
            <div className="sequence-list">
                {sequence.map((cmdId, index) => (
                    <div key={`${cmdId}-${index}`} className={`sequence-item ${cmdId.startsWith('__sleep:') ? 'sequence-sleep' : cmdId.startsWith('__echo:') ? 'sequence-echo' : ''}`}>
                        <span className="sequence-index">{index + 1}.</span>
                        <span className="sequence-title">{getEntryLabel(cmdId)}</span>
                        <div className="sequence-actions">
                            <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0}>↑</button>
                            <button type="button" onClick={() => onMoveDown(index)} disabled={index === sequence.length - 1}>↓</button>
                            <button type="button" onClick={() => onRemove(index)}>✕</button>
                        </div>
                    </div>
                ))}
                {sequence.length === 0 && <div className="empty-sequence">No commands added yet.</div>}
            </div>
        </div>
    );
};
