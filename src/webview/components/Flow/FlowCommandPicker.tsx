import React, { useMemo, useState } from 'react';
import { Command } from '../../types';
import { useCategoryState } from '../../hooks/useCategoryState';
import { SleepAdder, EchoAdder } from './FlowFormHelpers';

interface FlowCommandPickerProps {
    seq: string[];
    setSeq: React.Dispatch<React.SetStateAction<string[]>>;
    availableCommands: Command[];
}

export const FlowCommandPicker: React.FC<FlowCommandPickerProps> = ({ seq, setSeq, availableCommands }) => {
    const [sleepMs, setSleepMs] = useState('1000');
    const [echoText, setEchoText] = useState('');

    const cmdsByCat = useMemo(() => {
        const grouped: Record<string, Command[]> = {};
        availableCommands.forEach(cmd => {
            const c = cmd.category || 'Uncategorized';
            if (!grouped[c]) grouped[c] = [];
            grouped[c].push(cmd);
        });
        return grouped;
    }, [availableCommands]);

    const categories = Object.keys(cmdsByCat).sort();
    const { expandedCategories: expCats, toggleCategory: toggleCat } = useCategoryState(categories, 'flowForm_expandedCategories');

    return (
        <div className="available-commands">
            <h4>Available Commands</h4>
            <div className="command-picker-list">{categories.map(cat => (
                    <div key={cat} className="picker-category-group">
                        <div className="picker-category-header" onClick={() => toggleCat(cat)}>
                            <span className={`chevron ${expCats[cat] ? 'expanded' : ''}`}>▶</span>
                            <span>{cat}</span><span className="category-count">{cmdsByCat[cat].length}</span>
                        </div>
                        {expCats[cat] && <div className="picker-category-items">{cmdsByCat[cat].map(cmd => (
                            <div key={cmd.id} className="picker-item" onClick={() => setSeq([...seq, cmd.id])}>
                                <span className="picker-title">{cmd.title}</span><span className="picker-add">+</span>
                            </div>
                        ))}</div>}
                    </div>
                ))}</div>
            <SleepAdder sleepMs={sleepMs} setSleepMs={setSleepMs} onAdd={() => { if (!isNaN(parseInt(sleepMs))) setSeq([...seq, `__sleep:${sleepMs}`]); }} />
            <EchoAdder echoText={echoText} setEchoText={setEchoText} onAdd={() => { if (echoText.trim()) setSeq([...seq, `__echo:${echoText.trim()}`]); setEchoText(''); }} />
        </div>
    );
};
