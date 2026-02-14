import React, { useState } from 'react';

interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
}

interface Props {
    flows: Flow[];
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
}

export const FlowList: React.FC<Props> = ({ flows, onRun, onEdit, onDelete }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const groupedFlows = flows.reduce((acc, flow) => {
        const category = flow.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(flow);
        return acc;
    }, {} as Record<string, Flow[]>);

    return (
        <div className="flow-list">
            {Object.entries(groupedFlows).map(([category, items]) => (
                <div key={category} className="category-group">
                    <div
                        className="category-header"
                        onClick={() => toggleCategory(category)}
                    >
                        <span className={`codicon codicon-chevron-${expandedCategories[category] ? 'down' : 'right'}`}></span>
                        <span className="category-title">{category}</span>
                    </div>
                    {expandedCategories[category] && (
                        <div className="category-items">
                            {items.map(flow => (
                                <div key={flow.id} className="flow-item">
                                    <div className="flow-info">
                                        <div className="flow-header">
                                            <span className="flow-title">{flow.title}</span>
                                            <span className="flow-badge">{flow.sequence.length} steps</span>
                                        </div>
                                        <div className="flow-description">{flow.description}</div>
                                    </div>
                                    <div className="flow-actions">
                                        <button title="Run" onClick={() => onRun(flow.id)}>▶</button>
                                        <button title="Edit" onClick={() => onEdit(flow)}>✎</button>
                                        <button title="Delete" onClick={() => onDelete(flow.id)}>🗑</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {flows.length === 0 && (
                <div className="empty-state">No flows found. Create one to get started.</div>
            )}
        </div>
    );
};
