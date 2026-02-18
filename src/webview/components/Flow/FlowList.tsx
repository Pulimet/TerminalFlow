import React from 'react';
import { Flow, Command } from '../../types';
import { FlowCategory } from './FlowCategory';
import { useCategoryState } from '../../hooks/useCategoryState';
import { ListActions } from '../ListActions';

/**
 * Props for the FlowList component.
 */
interface FlowListProps {
    flows: Flow[];
    commands: Command[];
    categoryOrder?: string[];
    onRun: (id: string, fromIndex?: number) => void;
    onEdit: (flow: Flow) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onRunCommand: (id: string) => void;
    onReorderFlows: (flows: Flow[]) => void;
    onReorderCategories: (order: string[]) => void;
    onExport?: (id: string) => void;
    onExportAll?: () => void;
    onImport?: () => void;
}

import { useListLogic } from '../../hooks/useListLogic';

const STORAGE_KEY = 'tf-flow-categories';

/**
 * Renders a list of flows grouped by category.
 * @param props The component props.
 * @returns The rendered FlowList component.
 */
export const FlowList: React.FC<FlowListProps> = ({
    flows, commands, categoryOrder = [], onRun, onEdit, onDelete, onMove, onRunCommand, onReorderFlows, onReorderCategories, onExport, onExportAll, onImport
}) => {
    const {
        searchQuery,
        setSearchQuery,
        groupedItems: groupedFlows,
        sortedCategories: categories,
        expandedCategories,
        toggleCategory,
        expandAll,
        collapseAll,
        moveCategoryUp,
        moveCategoryDown,
        moveItemUp,
        moveItemDown,
        filteredItems: filteredFlows
    } = useListLogic({
        items: flows,
        categoryOrder,
        storageKey: STORAGE_KEY,
        filterCallback: (flow, query) => {
            // Helper to get command content by ID
            const getCommandContent = (cmdId: string) => {
                const cmd = commands.find(c => c.id === cmdId);
                return cmd ? `${cmd.title} ${cmd.command} ${cmd.description}`.toLowerCase() : '';
            };

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
        },
        onReorderItems: onReorderFlows,
        onReorderCategories: onReorderCategories
    });

    return (
        <div className="flow-list">
            <ListActions
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                onExport={onExportAll}
                onImport={onImport}
            />
            {categories.map((category, index) => (
                <FlowCategory
                    key={category}
                    category={category}
                    flows={groupedFlows[category]}
                    commands={commands}
                    isExpanded={expandedCategories[category] !== false}
                    isFirst={index === 0}
                    isLast={index === categories.length - 1}
                    onToggle={toggleCategory}
                    onRun={onRun}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                    onRunCommand={onRunCommand}
                    onMoveCategoryUp={moveCategoryUp}
                    onMoveCategoryDown={moveCategoryDown}
                    onMoveFlowUp={moveItemUp}
                    onMoveFlowDown={moveItemDown}
                    onExport={onExport}
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
