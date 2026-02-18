import React from 'react';

/**
 * Props for the SearchBar component.
 */
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * A reusable search bar component.
 * @param props The component props.
 * @returns The rendered SearchBar component.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    className = ''
}) => {
    return (
        <div className={`search-container ${className}`}>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    className="search-clear-btn"
                    onClick={() => onChange('')}
                    title="Clear search"
                    type="button"
                >
                    <svg viewBox="0 0 16 16">
                        <path d="M4 4 L12 12" />
                        <path d="M12 4 L4 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};
