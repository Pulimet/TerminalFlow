import React from 'react';
import { Command, Flow } from '../../types';
import { FlowList } from './FlowList';
import { FlowForm } from './FlowForm';

/**
 * Props for the FlowView component.
 */
interface FlowViewProps {
    /** The list of available flows. */
    flows: Flow[];
    /** The list of available commands (used within flows). */
    commands: Command[];
    /** The current scope (workspace or user). */
    scope: 'workspace' | 'user';
    /** The order of flow categories. */
    categoryOrder: string[];
    /** The current view mode (list or form). */
    view: 'list' | 'form';
    /** Function to set the view mode. */
    setView: (view: 'list' | 'form') => void;
    /** The flow currently being edited, if any. */
    editingItem: Flow | undefined;
    /** Function to set the flow being edited. */
    setEditingItem: (item: Flow | undefined) => void;
    /** Function to send messages to the extension. */
    sendMessage: (type: string, payload?: any) => void;
}

/**
 * The FlowView component.
 * Manages the display and interaction of flows, switching between list and form views.
 * @param props The props for the FlowView component.
 * @returns The rendered FlowView component.
 */
export const FlowView: React.FC<FlowViewProps> = ({
    flows,
    commands,
    scope,
    categoryOrder,
    view,
    setView,
    editingItem,
    setEditingItem,
    sendMessage
}) => {
    const filteredFlows = flows.filter(f => (f.source || 'workspace') === scope);

    const handleSave = (data: Flow) => {
        if (!data.source) data.source = scope;
        sendMessage('saveFlow', { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (id: string) => {
        sendMessage('deleteFlow', { id });
    };

    const handleMove = (id: string) => {
        const targetSource = scope === 'workspace' ? 'user' : 'workspace';
        sendMessage('moveFlow', { id, targetSource });
    };

    if (view === 'form') {
        return (
            <FlowForm
                initialFlow={editingItem}
                availableCommands={commands}
                onSave={handleSave}
                onCancel={() => setView('list')}
            />
        );
    }

    return (
        <FlowList
            flows={filteredFlows}
            commands={commands}
            categoryOrder={categoryOrder}
            onRun={(id, fromIndex) => sendMessage('runFlow', { id, fromIndex })}
            onRunCommand={(id) => sendMessage('runCommand', { id })}
            onEdit={(f) => { setEditingItem(f); setView('form'); }}
            onDelete={handleDelete}
            onMove={handleMove}
            onReorderFlows={(fls) => sendMessage('reorderFlows', { data: fls })}
            onReorderCategories={(order) => sendMessage('saveFlowCategoryOrder', { data: order })}
        />
    );
};
