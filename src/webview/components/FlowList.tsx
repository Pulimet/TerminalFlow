import React, { useState, useEffect } from 'react';

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
    flows: Flow[];
    commands: Command[];
    onRun: (id: string) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onRunCommand: (id: string) => void;
}

const STORAGE_KEY = 'tf-flow-categories';

function loadCategoryState(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCategoryState(state: Record<string, boolean>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const FlowList: React.FC<Props> = ({ flows, commands, onRun, onEdit, onDelete, onRunCommand }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        const saved = loadCategoryState();
        const categories = [...new Set(flows.map(f => f.category || 'Uncategorized'))];
        const merged: Record<string, boolean> = {};
        categories.forEach(cat => {
            merged[cat] = saved[cat] !== undefined ? saved[cat] : true;
        });
        return merged;
    });

    const [expandedFlows, setExpandedFlows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setExpandedCategories(prev => {
            const updated = { ...prev };
            flows.forEach(flow => {
                const cat = flow.category || 'Uncategorized';
                if (updated[cat] === undefined) {
                    updated[cat] = true;
                }
            });
            return updated;
        });
    }, [flows]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = { ...prev, [category]: !prev[category] };
            saveCategoryState(next);
            return next;
        });
    };

    const toggleFlow = (flowId: string) => {
        setExpandedFlows(prev => ({
            ...prev,
            [flowId]: !prev[flowId]
        }));
    };

    const resolveCommand = (cmdId: string): Command | undefined => {
        return commands.find(c => c.id === cmdId);
    };

    const isSleepCommand = (cmdId: string): boolean => {
        return cmdId.startsWith('__sleep:');
    };

    const getSleepMs = (cmdId: string): string => {
        return cmdId.replace('__sleep:', '');
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
            {Object.entries(groupedFlows).map(([category, items]) => {
                const isExpanded = expandedCategories[category] !== false;
                return (
                    <div key={category} className="category-group">
                        <div
                            className="category-header"
                            onClick={() => toggleCategory(category)}
                        >
                            <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                            <span className="category-title">{category}</span>
                            <span className="category-count">{items.length}</span>
                        </div>
                        {isExpanded && (
                            <div className="category-items">
                                {items.map(flow => {
                                    const isFlowExpanded = expandedFlows[flow.id] || false;
                                    return (
                                        <div key={flow.id} className="flow-item-wrapper">
                                            <div className="flow-item">
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
                                            <div className="flow-item-footer">
                                                <span
                                                    className={`flow-detail-toggle ${isFlowExpanded ? 'expanded' : ''}`}
                                                    onClick={() => toggleFlow(flow.id)}
                                                    title={isFlowExpanded ? 'Hide steps' : 'Show steps'}
                                                >
                                                    {isFlowExpanded ? '▾ Hide steps' : '▸ Show steps'}
                                                </span>
                                            </div>
                                            {isFlowExpanded && flow.sequence.length > 0 && (
                                                <div className="flow-steps">
                                                    {flow.sequence.map((cmdId, index) => {
                                                        if (isSleepCommand(cmdId)) {
                                                            return (
                                                                <div key={index} className="flow-step-item flow-step-sleep">
                                                                    <span className="flow-step-icon">⏱</span>
                                                                    <span className="flow-step-index">{index + 1}.</span>
                                                                    <div className="flow-step-details">
                                                                        <span className="flow-step-name">Sleep</span>
                                                                        <span className="flow-step-command">sleep {Number(getSleepMs(cmdId)) / 1000}s</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        const cmd = resolveCommand(cmdId);
                                                        return (
                                                            <div key={index} className="flow-step-item">
                                                                <span
                                                                    className="flow-step-icon flow-step-run"
                                                                    title="Run this command"
                                                                    onClick={() => onRunCommand(cmdId)}
                                                                >▶</span>
                                                                <span className="flow-step-index">{index + 1}.</span>
                                                                <div className="flow-step-details">
                                                                    <span className="flow-step-name">{cmd ? cmd.title : `Unknown`}</span>
                                                                    <span className="flow-step-command">{cmd ? cmd.command : cmdId}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
            {flows.length === 0 && (
                <div className="empty-state">No flows found. Create one to get started.</div>
            )}
        </div>
    );
};
