import React from 'react';

interface ListActionsProps {
    onExpandAll: () => void;
    onCollapseAll: () => void;
    searchQuery: string;
    onSearch: (query: string) => void;
}

import { SearchBar } from './SearchBar';

export const ListActions: React.FC<ListActionsProps> = ({ onExpandAll, onCollapseAll, searchQuery, onSearch }) => {
    return (
        <div className="list-actions">
            <SearchBar value={searchQuery} onChange={onSearch} />
            <div className="action-buttons">
                <button onClick={onExpandAll} className="icon-button" title="Expand All">
                    <svg viewBox="0 0 16 16">
                        <path d="M4 5 L8 1 L12 5" />
                        <path d="M4 11 L8 15 L12 11" />
                    </svg>
                </button>
                <button onClick={onCollapseAll} className="icon-button" title="Collapse All">
                    <svg viewBox="0 0 16 16">
                        <path d="M4 3 L8 7 L12 3" />
                        <path d="M4 13 L8 9 L12 13" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
