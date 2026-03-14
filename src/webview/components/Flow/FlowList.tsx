import React from 'react';
import { Flow, Command } from '../../types';
import { FlowCategory } from './FlowCategory';
import { useListLogic } from '../../hooks/useListLogic';
import { ListActions } from '../ListActions';

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
    onDuplicate: (flow: Flow) => void;
    onCopy: (text: string) => void;
}

const getCmdText = (cmds: Command[], id: string) => {
    const c = cmds.find(x => x.id === id);
    return c ? `${c.title} ${c.command} ${c.description}`.toLowerCase() : '';
};

const filterFlow = (flow: Flow, q: string, cmds: Command[]) => {
    if (flow.title.toLowerCase().includes(q) || flow.description.toLowerCase().includes(q)) return true;
    return flow.sequence.some(item => {
        if (item.startsWith('__echo:')) return item.substring(7).toLowerCase().includes(q);
        if (item.startsWith('__sleep:')) return false;
        return getCmdText(cmds, item).includes(q);
    });
};

export const FlowList: React.FC<FlowListProps> = (props) => {
    const logic = useListLogic({
        items: props.flows, categoryOrder: props.categoryOrder || [], storageKey: 'tf-flow-categories',
        filterCallback: (f, q) => filterFlow(f, q, props.commands),
        onReorderItems: props.onReorderFlows, onReorderCategories: props.onReorderCategories
    });

    return (
        <div className="flow-list">
            <ListActions
                onExpandAll={logic.expandAll} onCollapseAll={logic.collapseAll}
                searchQuery={logic.searchQuery} onSearch={logic.setSearchQuery}
                onExport={props.onExportAll} onImport={props.onImport}
            />
            {logic.sortedCategories.map((cat, i) => (
                <FlowCategory
                    key={cat} category={cat} flows={logic.groupedItems[cat]} commands={props.commands}
                    isExpanded={logic.expandedCategories[cat] !== false}
                    isFirst={i === 0} isLast={i === logic.sortedCategories.length - 1}
                    onToggle={logic.toggleCategory} onRun={props.onRun} onEdit={props.onEdit}
                    onDelete={props.onDelete} onMove={props.onMove} onRunCommand={props.onRunCommand}
                    onMoveCategoryUp={logic.moveCategoryUp} onMoveCategoryDown={logic.moveCategoryDown}
                    onMoveFlowUp={logic.moveItemUp} onMoveFlowDown={logic.moveItemDown}
                    onExport={props.onExport} onDuplicate={props.onDuplicate} onCopy={props.onCopy}
                />
            ))}
            {logic.filteredItems.length === 0 && (
                <div className="empty-state">
                    {logic.searchQuery ? 'No flows match search.' : 'No flows found.'}
                </div>
            )}
        </div>
    );
};
