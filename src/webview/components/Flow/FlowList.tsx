import React, { useState, useEffect } from 'react';
import { Flow, Command } from '../../types';
import { FlowCategory } from './FlowCategory';

interface FlowListProps {
    flows: Flow[];
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onRunCommand: (id: string) => void;
}

const STORAGE_KEY = 'tf-flow-categories';

export const FlowList: React.FC<FlowListProps> = ({ flows, commands, onRun, onEdit, onDelete, onRunCommand }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    });

    useEffect(() => {
        setExpandedCategories(prev => {
            const updated = { ...prev };
            flows.forEach(flow => {
                const cat = flow.category || 'Uncategorized';
                if (updated[cat] === undefined) updated[cat] = true;
            });
            return updated;
        });
    }, [flows]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = { ...prev, [category]: !prev[category] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const groupedFlows = flows.reduce((acc, flow) => {
        const category = flow.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(flow);
        return acc;
    }, {} as Record<string, Flow[]>);

    return (
        <div className="flow-list">
            {Object.entries(groupedFlows).map(([category, items]) => (
                <FlowCategory
                    key={category}
                    category={category}
                    flows={items}
                    commands={commands}
                    isExpanded={expandedCategories[category] !== false}
                    onToggle={toggleCategory}
                    onRun={onRun}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRunCommand={onRunCommand}
                />
            ))}
            {flows.length === 0 && <div className="empty-state">No flows found. Create one to get started.</div>}
        </div>
    );
};
