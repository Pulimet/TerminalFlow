import React from 'react';
import { Command } from '../../types';
import { CommandList } from './CommandList';
import { CommandForm } from './CommandForm';

/**
 * Props for the CommandView component.
 */
interface CommandViewProps {
    /** The list of available commands. */
    commands: Command[];
    /** The current scope (workspace or user). */
    scope: 'workspace' | 'user';
    /** The order of command categories. */
    categoryOrder: string[];
    /** The current view mode (list or form). */
    view: 'list' | 'form';
    /** Function to set the view mode. */
    setView: (view: 'list' | 'form') => void;
    /** The command currently being edited, if any. */
    editingItem: Command | undefined;
    /** Function to set the command being edited. */
    setEditingItem: (item: Command | undefined) => void;
    /** Function to send messages to the extension. */
    sendMessage: (type: string, payload?: any) => void;
}

/**
 * The CommandView component.
 * Manages the display and interaction of commands, switching between list and form views.
 * @param props The props for the CommandView component.
 * @returns The rendered CommandView component.
 */
export const CommandView: React.FC<CommandViewProps> = ({
    commands,
    scope,
    categoryOrder,
    view,
    setView,
    editingItem,
    setEditingItem,
    sendMessage
}) => {
    const filteredCommands = commands.filter(c => (c.source || 'workspace') === scope);

    const handleSave = (data: Command) => {
        if (!data.source) data.source = scope;
        sendMessage('saveCommand', { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (id: string) => {
        sendMessage('deleteCommand', { id });
    };

    const handleMove = (id: string) => {
        const targetSource = scope === 'workspace' ? 'user' : 'workspace';
        sendMessage('moveCommand', { id, targetSource });
    };

    const handleExport = (id?: string) => {
        sendMessage('exportCommands', { ids: id ? [id] : undefined });
    };

    const handleImport = () => {
        sendMessage('importCommands');
    };

    if (view === 'form') {
        const existingCategories = Array.from(new Set(commands.map(c => c.category || 'General'))).sort();
        return (
            <CommandForm
                initialCommand={editingItem}
                existingCategories={existingCategories}
                onSave={handleSave}
                onCancel={() => setView('list')}
            />
        );
    }

    return (
        <CommandList
            commands={filteredCommands}
            categoryOrder={categoryOrder}
            onRun={(id) => sendMessage('runCommand', { id })}
            onEdit={(c) => { setEditingItem(c); setView('form'); }}
            onDelete={handleDelete}
            onMove={handleMove}
            onReorderCommands={(cmds) => sendMessage('reorderCommands', { data: cmds })}
            onReorderCategories={(order) => sendMessage('saveCommandCategoryOrder', { data: order })}
            onExport={handleExport}
            onExportAll={() => handleExport()}
            onImport={handleImport}
        />
    );
};
