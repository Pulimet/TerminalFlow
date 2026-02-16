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
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredFlows = React.useMemo(() => {
        if (!searchQuery.trim()) return flows;

        const query = searchQuery.toLowerCase();

        // Helper to get command content by ID
        const getCommandContent = (cmdId: string) => {
            const cmd = commands.find(c => c.id === cmdId);
            return cmd ? `${cmd.title} ${cmd.command} ${cmd.description}`.toLowerCase() : '';
        };

        return flows.filter(flow => {
            // Check basic flow info
            if (
                flow.title.toLowerCase().includes(query) ||
                flow.description.toLowerCase().includes(query)
            ) {
                return true;
            }

            // Check sequence items
            return flow.sequence.some(item => {
                if (item.startsWith('__echo:')) {
                    return item.substring(7).toLowerCase().includes(query);
                }
                if (item.startsWith('__sleep:')) {
                    return false; // Don't search in sleep duration
                }
                // It's a command ID
                return getCommandContent(item).includes(query);
            });
        });
    }, [flows, commands, searchQuery]);

    const groupedFlows = filteredFlows.reduce((acc, flow) => {
        const category = flow.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(flow);
        return acc;
    }, {} as Record<string, Flow[]>);

    const categories = Object.keys(groupedFlows);
    const { expandedCategories, toggleCategory, expandAll, collapseAll } = useCategoryState(categories, STORAGE_KEY);

    return (
        <div className="flow-list">
            <ListActions
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />
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
            {filteredFlows.length === 0 && (
                <div className="empty-state">
                    {searchQuery ? 'No flows match your search.' : 'No flows found. Create one to get started.'}
                </div>
            )}
        </div>
    );
};
