import React from 'react';

interface HeaderProps {
    tab: 'commands' | 'flows';
    setTab: (tab: 'commands' | 'flows') => void;
    scope: 'workspace' | 'user';
    setScope: (scope: 'workspace' | 'user') => void;
    showAddButton: boolean;
    onAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tab, setTab, scope, setScope, showAddButton, onAdd }) => {
    return (
        <div className="header">
            <div className="tabs">
                <button
                    className={tab === 'commands' ? 'active' : ''}
                    onClick={() => setTab('commands')}
                >
                    Commands
                </button>
                <button
                    className={tab === 'flows' ? 'active' : ''}
                    onClick={() => setTab('flows')}
                >
                    Flows
                </button>
            </div>
            <div className="scope-toggle">
                <button
                    className={scope === 'workspace' ? 'active' : ''}
                    onClick={() => setScope('workspace')}
                >
                    Workspace
                </button>
                <button
                    className={scope === 'user' ? 'active' : ''}
                    onClick={() => setScope('user')}
                >
                    Personal
                </button>
            </div>
            {showAddButton && (
                <button
                    className="add-button"
                    onClick={onAdd}
                    title={`Add ${tab === 'commands' ? 'Command' : 'Flow'}`}
                >
                    +
                </button>
            )}
        </div>
    );
};
