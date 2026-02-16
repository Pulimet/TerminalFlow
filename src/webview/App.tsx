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

    const handleSave = (type: 'Command' | 'Flow', data: any) => {
        sendMessage(`save${type}`, { data });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDelete = (type: 'Command' | 'Flow', id: string) => {
        sendMessage(`delete${type}`, { id });
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
                    commands={commands}
                    categoryOrder={commandCategoryOrder}
                    onRun={(id) => sendMessage('runCommand', { id })}
                    onEdit={(c) => { setEditingItem(c); setView('form'); }}
                    onDelete={(id) => handleDelete('Command', id)}
                    onReorderCommands={(cmds) => sendMessage('reorderCommands', { data: cmds })}
                    onReorderCategories={(order) => sendMessage('saveCommandCategoryOrder', { data: order })}
                />
            );
        }
        return (
            <FlowList
                flows={flows}
                commands={commands}
                categoryOrder={flowCategoryOrder}
                onRun={(id) => sendMessage('runFlow', { id })}
                onRunCommand={(id) => sendMessage('runCommand', { id })}
                onEdit={(f) => { setEditingItem(f); setView('form'); }}
                onDelete={(id) => handleDelete('Flow', id)}
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
                {view === 'list' && (
                    <button className="add-button" onClick={() => { setEditingItem(undefined); setView('form'); }}>+ Add {activeTab === 'commands' ? 'Command' : 'Flow'}</button>
                )}
            </div>
            <div className="content">{view === 'form' ? renderForm() : renderList()}</div>
        </div>
    );
};

export default App;
