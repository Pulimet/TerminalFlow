import React, { useState } from 'react';
import { useExtensionData } from './hooks/useExtensionData';
import { Command, Flow } from './types';
import { Header } from './components/Layout/Header';
import { CommandView } from './components/Command/CommandView';
import { FlowView } from './components/Flow/FlowView';

/**
 * The main application component for the Terminal Flow webview.
 * @returns The rendered App component.
 */
const App = () => {
    const { commands, flows, commandCategoryOrder, flowCategoryOrder, scope, setScope, tab, setTab, sendMessage } = useExtensionData();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<Command | Flow | undefined>(undefined);

    const handleAdd = () => {
        setEditingItem(undefined);
        setView('form');
    };

    return (
        <div className="app-container">
            <Header
                tab={tab}
                setTab={(newTab) => { setTab(newTab); setView('list'); }}
                scope={scope}
                setScope={setScope}
                showAddButton={view === 'list'}
                onAdd={handleAdd}
            />
            <div className="content">
                {tab === 'commands' ? (
                    <CommandView
                        commands={commands}
                        scope={scope}
                        categoryOrder={commandCategoryOrder}
                        view={view}
                        setView={setView}
                        editingItem={editingItem as Command}
                        setEditingItem={setEditingItem}
                        sendMessage={sendMessage}
                    />
                ) : (
                    <FlowView
                        flows={flows}
                        commands={commands}
                        scope={scope}
                        categoryOrder={flowCategoryOrder}
                        view={view}
                        setView={setView}
                        editingItem={editingItem as Flow}
                        setEditingItem={setEditingItem}
                        sendMessage={sendMessage}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
