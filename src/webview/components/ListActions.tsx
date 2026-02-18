import React from 'react';

/**
 * Props for the ListActions component.
 */
interface ListActionsProps {
    onExpandAll: () => void;
    onCollapseAll: () => void;
    searchQuery: string;
    onSearch: (query: string) => void;
    onExport?: () => void;
    onImport?: () => void;
}

import { SearchBar } from './SearchBar';

/**
 * Component for list-wide actions like search, expand all, and collapse all.
 * @param props The component props.
 * @returns The rendered ListActions component.
 */
export const ListActions: React.FC<ListActionsProps> = ({ onExpandAll, onCollapseAll, searchQuery, onSearch, onExport, onImport }) => {
    return (
        <div className="list-actions">
            <SearchBar value={searchQuery} onChange={onSearch} />
            <div className="action-buttons">
                {onExport && (
                    <button onClick={onExport} className="icon-button" title="Export All">
                        <svg viewBox="0 0 16 16">
                            <path d="M8 11V1M8 1L4 5M8 1L12 5M15 15H1" stroke="currentColor" fill="none" />
                        </svg>
                    </button>
                )}
                {onImport && (
                    <button onClick={onImport} className="icon-button" title="Import">
                        <svg viewBox="0 0 16 16">
                            <path d="M8 5V15M8 15L4 11M8 15L12 11M1 1H15" stroke="currentColor" fill="none" />
                        </svg>
                    </button>
                )}
                <button onClick={onExpandAll} className="icon-button" title="Expand All">
                    <svg viewBox="0 0 16 16">
                        <path d="M4 5 L8 1 L12 5" />
                        <path d="M4 11 L8 15 L12 11" />
                    </svg>
                </button>
                <button onClick={onCollapseAll} className="icon-button" title="Collapse All">
                    <svg viewBox="0 0 16 16">
                        <path d="M4 1 L8 5 L12 1" />
                        <path d="M4 15 L8 11 L12 15" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
