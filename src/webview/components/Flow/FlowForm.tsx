import React, { useState } from 'react';
import { Flow, Command } from '../../types';
import { SequenceBuilder } from './SequenceBuilder';
import { SleepAdder, EchoAdder } from './FlowFormHelpers';

interface FlowFormProps {
    initialFlow?: Flow;
    availableCommands: Command[];
    onSave: (flow: Flow) => void;
    onCancel: () => void;
}

import { useCategoryState } from '../../hooks/useCategoryState';

export const FlowForm: React.FC<FlowFormProps> = ({ initialFlow, availableCommands, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialFlow?.title || '');
    const [description, setDescription] = useState(initialFlow?.description || '');
    const [category, setCategory] = useState(initialFlow?.category || '');
    const [sequence, setSequence] = useState<string[]>(initialFlow?.sequence || []);
    const [runInNewTerminal, setRunInNewTerminal] = useState(initialFlow?.runInNewTerminal || false);
    const [sleepMs, setSleepMs] = useState('1000');
    const [echoText, setEchoText] = useState('');

    // Group commands by category
    const commandsByCategory = React.useMemo(() => {
        const grouped: Record<string, Command[]> = {};
        availableCommands.forEach(cmd => {
            const cat = cmd.category || 'Uncategorized';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(cmd);
        });
        return grouped;
    }, [availableCommands]);

    const categories = Object.keys(commandsByCategory).sort();
    const { expandedCategories, toggleCategory } = useCategoryState(categories, 'flowForm_expandedCategories');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialFlow?.id || crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || 'General',
            sequence,
            runInNewTerminal,
            source: initialFlow?.source
        });
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newSeq = [...sequence];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sequence.length) return;
        [newSeq[swapIndex], newSeq[index]] = [newSeq[index], newSeq[swapIndex]];
        setSequence(newSeq);
    };

    return (
        <form className="flow-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Full Deployment" /></div>
            <div className="form-group"><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." /></div>
            <div className="form-group"><label>Category</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Workflows" /></div>
            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={runInNewTerminal}
                        onChange={e => setRunInNewTerminal(e.target.checked)}
                    />
                    Run in new terminal
                </label>
            </div>

            <div className="flow-builder">
                <div className="available-commands">
                    <h4>Available Commands</h4>
                    <div className="command-picker-list">
                        {categories.map(cat => (
                            <div key={cat} className="picker-category-group">
                                <div className="picker-category-header" onClick={() => toggleCategory(cat)}>
                                    <span className={`chevron ${expandedCategories[cat] ? 'expanded' : ''}`}>▶</span>
                                    <span>{cat}</span>
                                    <span className="category-count">{commandsByCategory[cat].length}</span>
                                </div>
                                {expandedCategories[cat] && (
                                    <div className="picker-category-items">
                                        {commandsByCategory[cat].map(cmd => (
                                            <div key={cmd.id} className="picker-item" onClick={() => setSequence([...sequence, cmd.id])}>
                                                <span className="picker-title">{cmd.title}</span><span className="picker-add">+</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <SleepAdder sleepMs={sleepMs} setSleepMs={setSleepMs} onAdd={() => { if (!isNaN(parseInt(sleepMs))) setSequence([...sequence, `__sleep:${sleepMs}`]); }} />
                    <EchoAdder echoText={echoText} setEchoText={setEchoText} onAdd={() => { if (echoText.trim()) setSequence([...sequence, `__echo:${echoText.trim()}`]); setEchoText(''); }} />
                </div>
                <SequenceBuilder sequence={sequence} availableCommands={availableCommands} onMoveUp={(i) => moveItem(i, 'up')} onMoveDown={(i) => moveItem(i, 'down')} onRemove={(i) => setSequence(sequence.filter((_, idx) => idx !== i))} />
            </div>
            <div className="form-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Save</button></div>
        </form>
    );
};
