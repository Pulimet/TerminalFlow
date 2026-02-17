import React, { useState } from 'react';
import { useExtensionData } from './hooks/useExtensionData';
import { CommandList } from './components/Command/CommandList';
import { FlowList } from './components/Flow/FlowList';
import { CommandForm } from './components/Command/CommandForm';
import { FlowForm } from './components/Flow/FlowForm';
import { Command, Flow } from './types';

const App = () => {
    const { commands, flows, commandCategoryOrder, flowCategoryOrder, sendMessage } = useExtensionData();
    const [activeTab, setActiveTab] = useState<'commands' | 'flows'>('commands');
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<Command | Flow | undefined>(undefined);
    const [storageScope, setStorageScope] = useState<'workspace' | 'user'>('workspace');

    const filteredCommands = commands.filter(c => (c.source || 'workspace') === storageScope);
    const filteredFlows = flows.filter(f => (f.source || 'workspace') === storageScope);

    const handleSave = (type: 'Command' | 'Flow', data: any) => {
        // Ensure source is set to current scope if not present
        if (!data.source) data.source = storageScope;
        sendMessage(`save${type}`, { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (type: 'Command' | 'Flow', id: string) => {
        sendMessage(`delete${type}`, { id });
    };

    const handleMove = (type: 'Command' | 'Flow', id: string) => {
        const targetSource = storageScope === 'workspace' ? 'user' : 'workspace';
        sendMessage(`move${type}`, { id, targetSource });
    };

    const renderForm = () => {
        if (activeTab === 'commands') {
            return <CommandForm initialCommand={editingItem as Command} onSave={(c) => handleSave('Command', c)} onCancel={() => setView('list')} />;
        }
        return <FlowForm initialFlow={editingItem as Flow} availableCommands={commands} onSave={(f) => handleSave('Flow', f)} onCancel={() => setView('list')} />;
    };

    const renderList = () => {
        if (activeTab === 'commands') {
            return (
                <CommandList
                    commands={filteredCommands}
                    categoryOrder={commandCategoryOrder}
                    onRun={(id) => sendMessage('runCommand', { id })}
                    onEdit={(c) => { setEditingItem(c); setView('form'); }}
                    onDelete={(id) => handleDelete('Command', id)}
                    onMove={(id) => handleMove('Command', id)}
                    onReorderCommands={(cmds) => sendMessage('reorderCommands', { data: cmds })}
                    onReorderCategories={(order) => sendMessage('saveCommandCategoryOrder', { data: order })}
                />
            );
        }
        return (
            <FlowList
                flows={filteredFlows}
                commands={commands} // Pass all commands for lookup in flows
                categoryOrder={flowCategoryOrder}
                onRun={(id, fromIndex) => sendMessage('runFlow', { id, fromIndex })}
                onRunCommand={(id) => sendMessage('runCommand', { id })}
                onEdit={(f) => { setEditingItem(f); setView('form'); }}
                onDelete={(id) => handleDelete('Flow', id)}
                onMove={(id) => handleMove('Flow', id)}
                onReorderFlows={(fls) => sendMessage('reorderFlows', { data: fls })}
                onReorderCategories={(order) => sendMessage('saveFlowCategoryOrder', { data: order })}
            />
        );
    };

    return (
        <div className="app-container">
            <div className="header">
                <div className="tabs">
                    <button className={activeTab === 'commands' ? 'active' : ''} onClick={() => { setActiveTab('commands'); setView('list'); }}>Commands</button>
                    <button className={activeTab === 'flows' ? 'active' : ''} onClick={() => { setActiveTab('flows'); setView('list'); }}>Flows</button>
                </div>
                <div className="scope-toggle">
                    <button className={storageScope === 'workspace' ? 'active' : ''} onClick={() => setStorageScope('workspace')}>Workspace</button>
                    <button className={storageScope === 'user' ? 'active' : ''} onClick={() => setStorageScope('user')}>Personal</button>
                </div>
                {view === 'list' && (
                    <button className="add-button" onClick={() => { setEditingItem(undefined); setView('form'); }}>
                        + Add {activeTab === 'commands' ? 'Command' : 'Flow'}
                    </button>
                )}
            </div>
            <div className="content">{view === 'form' ? renderForm() : renderList()}</div>
        </div>
    );
};

export default App;
