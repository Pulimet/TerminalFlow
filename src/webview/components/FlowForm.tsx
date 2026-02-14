import React, { useState } from 'react';

interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
}

interface Props {
    initialFlow?: Flow;
    availableCommands: Command[];
    onSave: (flow: Flow) => void;
    onCancel: () => void;
}

export const FlowForm: React.FC<Props> = ({ initialFlow, availableCommands, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialFlow?.title || '');
    const [description, setDescription] = useState(initialFlow?.description || '');
    const [category, setCategory] = useState(initialFlow?.category || '');
    const [sequence, setSequence] = useState<string[]>(initialFlow?.sequence || []);

    const addToSequence = (commandId: string) => {
        setSequence([...sequence, commandId]);
    };

    const removeFromSequence = (index: number) => {
        const newSeq = [...sequence];
        newSeq.splice(index, 1);
        setSequence(newSeq);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSeq = [...sequence];
        [newSeq[index - 1], newSeq[index]] = [newSeq[index], newSeq[index - 1]];
        setSequence(newSeq);
    };

    const moveDown = (index: number) => {
        if (index === sequence.length - 1) return;
        const newSeq = [...sequence];
        [newSeq[index + 1], newSeq[index]] = [newSeq[index], newSeq[index + 1]];
        setSequence(newSeq);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const flowId = initialFlow?.id || crypto.randomUUID();

        const newFlow: Flow = {
            id: flowId,
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || 'General',
            sequence
        };

        onSave(newFlow);
    };

    const getCommandTitle = (id: string) => {
        const cmd = availableCommands.find(c => c.id === id);
        return cmd ? cmd.title : 'Unknown Command';
    };

    return (
        <form className="flow-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Full Deployment"
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short description..."
                />
            </div>

            <div className="form-group">
                <label>Category</label>
                <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Workflows"
                />
            </div>

            <div className="flow-builder">
                <div className="available-commands">
                    <h4>Available Commands (Click to add)</h4>
                    <div className="command-picker-list">
                        {availableCommands.map(cmd => (
                            <div
                                key={cmd.id}
                                className="picker-item"
                                onClick={() => addToSequence(cmd.id)}
                            >
                                <span className="picker-title">{cmd.title}</span>
                                <span className="picker-add">+</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sequence-builder">
                    <h4>Sequence</h4>
                    <div className="sequence-list">
                        {sequence.map((cmdId, index) => (
                            <div key={`${cmdId}-${index}`} className="sequence-item">
                                <span className="sequence-index">{index + 1}.</span>
                                <span className="sequence-title">{getCommandTitle(cmdId)}</span>
                                <div className="sequence-actions">
                                    <button type="button" onClick={() => moveUp(index)} disabled={index === 0}>↑</button>
                                    <button type="button" onClick={() => moveDown(index)} disabled={index === sequence.length - 1}>↓</button>
                                    <button type="button" onClick={() => removeFromSequence(index)}>✕</button>
                                </div>
                            </div>
                        ))}
                        {sequence.length === 0 && <div className="empty-sequence">No commands added yet.</div>}
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="submit" className="primary">Save</button>
            </div>
        </form>
    );
};
