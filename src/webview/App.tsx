import React, { useState, useEffect } from 'react';
import { CommandList } from './components/CommandList';
import { FlowList } from './components/FlowList';
import { CommandForm } from './components/CommandForm';
import { FlowForm } from './components/FlowForm';

// Define types locally to avoid importing from node context
interface Command {
    id: string;
    title: string;
    description: string;
    category: string;
    command: string;
}

interface Flow {
    id: string;
    title: string;
    description: string;
    category: string;
    sequence: string[];
}

// Acquire VS Code API
const vscode = acquireVsCodeApi();

const App = () => {
    const [commands, setCommands] = useState<Command[]>([]);
    const [flows, setFlows] = useState<Flow[]>([]);
    const [activeTab, setActiveTab] = useState<'commands' | 'flows'>('commands');

    // View state
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<Command | Flow | undefined>(undefined);

    useEffect(() => {
        // Handle messages from extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'updateData':
                    setCommands(message.commands);
                    setFlows(message.flows);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        // Request initial data
        vscode.postMessage({ type: 'refresh' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleRunCommand = (id: string) => {
        vscode.postMessage({ type: 'runCommand', id });
    };

    const handleRunFlow = (id: string) => {
        vscode.postMessage({ type: 'runFlow', id });
    };

    const handleSaveCommand = (command: Command) => {
        vscode.postMessage({ type: 'saveCommand', data: command });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDeleteCommand = (id: string) => {
        if (confirm('Are you sure you want to delete this command?')) {
            vscode.postMessage({ type: 'deleteCommand', id });
        }
    };

    const handleSaveFlow = (flow: Flow) => {
        vscode.postMessage({ type: 'saveFlow', data: flow });
        setView('list');
        setEditingItem(undefined);
    };

    const handleDeleteFlow = (id: string) => {
        if (confirm('Are you sure you want to delete this flow?')) {
            vscode.postMessage({ type: 'deleteFlow', id });
        }
    };

    const startAdd = () => {
        setEditingItem(undefined);
        setView('form');
    };

    const startEdit = (item: Command | Flow) => {
        setEditingItem(item);
        setView('form');
    };

    const renderContent = () => {
        if (view === 'form') {
            if (activeTab === 'commands') {
                return (
                    <CommandForm
                        initialCommand={editingItem as Command}
                        onSave={handleSaveCommand}
                        onCancel={() => setView('list')}
                    />
                );
            } else {
                return (
                    <FlowForm
                        initialFlow={editingItem as Flow}
                        availableCommands={commands}
                        onSave={handleSaveFlow}
                        onCancel={() => setView('list')}
                    />
                );
            }
        }

        if (activeTab === 'commands') {
            return (
                <CommandList
                    commands={commands}
                    onRun={handleRunCommand}
                    onEdit={startEdit}
                    onDelete={handleDeleteCommand}
                />
            );
        } else {
            return (
                <FlowList
                    flows={flows}
                    commands={commands}
                    onRun={handleRunFlow}
                    onEdit={startEdit}
                    onDelete={handleDeleteFlow}
                    onRunCommand={handleRunCommand}
                />
            );
        }
    };

    return (
        <div className="app-container">
            <div className="header">
                <div className="tabs">
                    <button
                        className={activeTab === 'commands' ? 'active' : ''}
                        onClick={() => { setActiveTab('commands'); setView('list'); }}
                    >
                        Commands
                    </button>
                    <button
                        className={activeTab === 'flows' ? 'active' : ''}
                        onClick={() => { setActiveTab('flows'); setView('list'); }}
                    >
                        Flows
                    </button>
                </div>
                {view === 'list' && (
                    <button className="add-button" onClick={startAdd}>
                        + Add {activeTab === 'commands' ? 'Command' : 'Flow'}
                    </button>
                )}
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;
