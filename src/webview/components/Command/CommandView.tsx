import React from 'react';
import { Command } from '../../types';
import { CommandList } from './CommandList';
import { CommandForm } from './CommandForm';
import { useCommandActions } from '../../hooks/useCommandActions';

interface CommandViewProps {
    commands: Command[];
    scope: 'workspace' | 'user';
    categoryOrder: string[];
    view: 'list' | 'form';
    setView: (view: 'list' | 'form') => void;
    editingItem: Command | undefined;
    setEditingItem: (item: Command | undefined) => void;
    sendMessage: (type: string, payload?: any) => void;
}

export const CommandView: React.FC<CommandViewProps> = (props) => {
    const { commands, scope, categoryOrder, view, setView, editingItem, setEditingItem, sendMessage } = props;
    const filteredCommands = commands.filter(c => (c.source || 'workspace') === scope);
    const actions = useCommandActions({ scope, setView, setEditingItem, sendMessage });

    if (view === 'form') {
        const existingCategories = Array.from(new Set(commands.map(c => c.category || 'General'))).sort();
        return (
            <CommandForm
                initialCommand={editingItem}
                existingCategories={existingCategories}
                onSave={actions.handleSave}
                onCancel={() => setView('list')}
            />
        );
    }

    return (
        <CommandList
            commands={filteredCommands}
            categoryOrder={categoryOrder}
            onRun={(id, interpolatedCommand) => sendMessage('runCommand', { id, interpolatedCommand })}
            onEdit={(c) => { setEditingItem(c); setView('form'); }}
            onDelete={actions.handleDelete}
            onMove={actions.handleMove}
            onReorderCommands={(cmds) => sendMessage('reorderCommands', { data: cmds })}
            onReorderCategories={(order) => sendMessage('saveCommandCategoryOrder', { data: order })}
            onExport={actions.handleExport}
            onExportAll={() => actions.handleExport()}
            onImport={actions.handleImport}
            onDuplicate={actions.handleDuplicate}
            onCopy={(id, interpolatedCommand) => {
                const cmd = commands.find(c => c.id === id);
                if (cmd) sendMessage('copyToClipboard', { text: interpolatedCommand || cmd.command });
            }}
        />
    );
};
