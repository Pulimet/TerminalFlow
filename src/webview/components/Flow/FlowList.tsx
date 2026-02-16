import React from 'react';
import { Flow, Command } from '../../types';
import { FlowCategory } from './FlowCategory';
import { useCategoryState } from '../../hooks/useCategoryState';
import { ListActions } from '../ListActions';

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
    const groupedFlows = flows.reduce((acc, flow) => {
        const category = flow.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(flow);
        return acc;
    }, {} as Record<string, Flow[]>);

    const categories = Object.keys(groupedFlows);
    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(categories, STORAGE_KEY);

    return (
        <div className="flow-list">
            <ListActions onExpandAll={expandAll} onCollapseAll={collapseAll} />
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
