import React from 'react';
import { Command } from '../../types';
import { CommandCategory } from './CommandCategory';
import { useListLogic } from '../../hooks/useListLogic';
import { ListActions } from '../ListActions';

interface Props {
    commands: Command[];
    categoryOrder?: string[];
    onRun: (id: string) => void;
    onEdit: (command: Command) => void;
    onDelete: (id: string) => void;
    onMove: (id: string) => void;
    onReorderCommands: (commands: Command[]) => void;
    onReorderCategories: (order: string[]) => void;
    onExport?: (id: string) => void;
    onExportAll?: () => void;
    onImport?: () => void;
    onDuplicate: (command: Command) => void;
    onCopy: (id: string) => void;
}

const filterCmd = (cmd: Command, q: string) =>
    cmd.title.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q) || cmd.command.toLowerCase().includes(q);

export const CommandList: React.FC<Props> = (props) => {
    const logic = useListLogic({
        items: props.commands, categoryOrder: props.categoryOrder || [], storageKey: 'tf-cmd-categories',
        filterCallback: filterCmd, onReorderItems: props.onReorderCommands, onReorderCategories: props.onReorderCategories
    });

    return (
        <div className="command-list">
            <ListActions
                onExpandAll={logic.expandAll} onCollapseAll={logic.collapseAll}
                searchQuery={logic.searchQuery} onSearch={logic.setSearchQuery}
                onExport={props.onExportAll} onImport={props.onImport}
            />
            {logic.sortedCategories.map((cat, i) => (
                <CommandCategory
                    key={cat} category={cat} commands={logic.groupedItems[cat]}
                    isExpanded={logic.expandedCategories[cat] !== false}
                    isFirst={i === 0} isLast={i === logic.sortedCategories.length - 1}
                    onToggle={logic.toggleCategory} onRun={props.onRun} onEdit={props.onEdit}
                    onDelete={props.onDelete} onMove={props.onMove}
                    onMoveCategoryUp={logic.moveCategoryUp} onMoveCategoryDown={logic.moveCategoryDown}
                    onMoveCommandUp={logic.moveItemUp} onMoveCommandDown={logic.moveItemDown}
                    onExport={props.onExport} onDuplicate={props.onDuplicate} onCopy={props.onCopy}
                />
            ))}
            {logic.filteredItems.length === 0 && (
                <div className="empty-state">
                    {logic.searchQuery ? 'No commands match search.' : 'No commands found. Create one.'}
                </div>
            )}
        </div>
    );
};
