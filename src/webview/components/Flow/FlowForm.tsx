import React, { useState } from 'react';
import { Flow, Command } from '../../types';
import { FlowBuilder } from './FlowBuilder';

interface FlowFormProps {
    initialFlow?: Flow; availableCommands: Command[]; existingCategories: string[];
    onSave: (flow: Flow) => void; onCancel: () => void;
}

export const FlowForm: React.FC<FlowFormProps> = ({ initialFlow, availableCommands, existingCategories, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialFlow?.title || '');
    const [desc, setDesc] = useState(initialFlow?.description || '');
    const [category, setCategory] = useState(initialFlow?.category || '');
    const [seq, setSeq] = useState<string[]>(initialFlow?.sequence || []);
    const [runNewTerm, setRunNewTerm] = useState(initialFlow?.runInNewTerminal || false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialFlow?.id || crypto.randomUUID(), title: title.trim(), description: desc.trim(), category: category.trim() || 'General', sequence: seq, runInNewTerminal: runNewTerm, source: initialFlow?.source });
    };

    return (
        <form className="flow-form" onSubmit={onSubmit}>
            <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div className="form-group"><label>Description</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div className="form-group"><label>Category</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} list="flow-cats" />
                <datalist id="flow-cats">{existingCategories.map(c => <option key={c} value={c} />)}</datalist></div>
            <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" checked={runNewTerm} onChange={e => setRunNewTerm(e.target.checked)} />Run in new terminal</label></div>
            <FlowBuilder seq={seq} setSeq={setSeq} availableCommands={availableCommands} />
            <div className="form-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Save</button></div>
        </form>
    );
};

