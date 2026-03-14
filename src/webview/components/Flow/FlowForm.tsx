import React, { useState, useMemo } from 'react';
import { Flow, Command } from '../../types';
import { SequenceBuilder } from './SequenceBuilder';
import { SleepAdder, EchoAdder } from './FlowFormHelpers';
import { useCategoryState } from '../../hooks/useCategoryState';

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
    const [sleepMs, setSleepMs] = useState('1000');
    const [echoText, setEchoText] = useState('');

    const cmdsByCat = useMemo(() => {
        const grouped: Record<string, Command[]> = {};
        availableCommands.forEach(cmd => { const c = cmd.category || 'Uncategorized'; if (!grouped[c]) grouped[c] = []; grouped[c].push(cmd); });
        return grouped;
    }, [availableCommands]);

    const categories = Object.keys(cmdsByCat).sort();
    const { expandedCategories: expCats, toggleCategory: toggleCat } = useCategoryState(categories, 'flowForm_expandedCategories');

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialFlow?.id || crypto.randomUUID(), title: title.trim(), description: desc.trim(), category: category.trim() || 'General', sequence: seq, runInNewTerminal: runNewTerm, source: initialFlow?.source });
    };

    const moveItem = (i: number, up: boolean) => {
        const swap = up ? i - 1 : i + 1;
        if (swap < 0 || swap >= seq.length) return;
        const nSeq = [...seq]; [nSeq[swap], nSeq[i]] = [nSeq[i], nSeq[swap]]; setSeq(nSeq);
    };

    return (
        <form className="flow-form" onSubmit={onSubmit}>
            <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div className="form-group"><label>Description</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div className="form-group"><label>Category</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} list="flow-cats" />
                <datalist id="flow-cats">{existingCategories.map(c => <option key={c} value={c} />)}</datalist></div>
            <div className="form-group checkbox-group"><label className="checkbox-label"><input type="checkbox" checked={runNewTerm} onChange={e => setRunNewTerm(e.target.checked)} />Run in new terminal</label></div>
            <div className="flow-builder">
                <div className="available-commands">
                    <h4>Available Commands</h4>
                    <div className="command-picker-list">{categories.map(cat => (
                            <div key={cat} className="picker-category-group">
                                <div className="picker-category-header" onClick={() => toggleCat(cat)}><span className={`chevron ${expCats[cat] ? 'expanded' : ''}`}>▶</span><span>{cat}</span><span className="category-count">{cmdsByCat[cat].length}</span></div>
                                {expCats[cat] && <div className="picker-category-items">{cmdsByCat[cat].map(cmd => (<div key={cmd.id} className="picker-item" onClick={() => setSeq([...seq, cmd.id])}><span className="picker-title">{cmd.title}</span><span className="picker-add">+</span></div>))}</div>}
                            </div>
                        ))}</div>
                    <SleepAdder sleepMs={sleepMs} setSleepMs={setSleepMs} onAdd={() => { if (!isNaN(parseInt(sleepMs))) setSeq([...seq, `__sleep:${sleepMs}`]); }} />
                    <EchoAdder echoText={echoText} setEchoText={setEchoText} onAdd={() => { if (echoText.trim()) setSeq([...seq, `__echo:${echoText.trim()}`]); setEchoText(''); }} />
                </div>
                <SequenceBuilder sequence={seq} availableCommands={availableCommands} onMoveUp={(i) => moveItem(i, true)} onMoveDown={(i) => moveItem(i, false)} onRemove={(i) => setSeq(seq.filter((_, idx) => idx !== i))} />
            </div>
            <div className="form-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Save</button></div>
        </form>
    );
};
