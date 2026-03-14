import React from 'react';
import { Command, Flow } from '../../types';
import { FlowList } from './FlowList';
import { FlowForm } from './FlowForm';
import { useFlowActions } from '../../hooks/useFlowActions';

interface FlowViewProps {
    flows: Flow[];
    commands: Command[];
    scope: 'workspace' | 'user';
    categoryOrder: string[];
    view: 'list' | 'form';
    setView: (view: 'list' | 'form') => void;
    editingItem: Flow | undefined;
    setEditingItem: (item: Flow | undefined) => void;
    sendMessage: (type: string, payload?: any) => void;
}

export const FlowView: React.FC<FlowViewProps> = (props) => {
    const { flows, commands, scope, categoryOrder, view, setView, editingItem, setEditingItem, sendMessage } = props;
    const filteredFlows = flows.filter(f => (f.source || 'workspace') === scope);
    const actions = useFlowActions({ scope, setView, setEditingItem, sendMessage });

    if (view === 'form') {
        const existingCategories = Array.from(new Set(flows.map(f => f.category || 'General'))).sort();
        return (
            <FlowForm
                initialFlow={editingItem}
                availableCommands={commands}
                existingCategories={existingCategories}
                onSave={actions.handleSave}
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
            onDelete={actions.handleDelete}
            onMove={actions.handleMove}
            onReorderFlows={(fls) => sendMessage('reorderFlows', { data: fls })}
            onReorderCategories={(order) => sendMessage('saveFlowCategoryOrder', { data: order })}
            onExport={actions.handleExport}
            onExportAll={() => actions.handleExport()}
            onImport={actions.handleImport}
            onDuplicate={actions.handleDuplicate}
            onCopy={(text) => sendMessage('copyToClipboard', { text })}
        />
    );
};
