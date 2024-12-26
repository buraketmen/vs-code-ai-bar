import * as React from 'react';

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => (
    <div className="relative w-full">
        <input
            type="text"
            placeholder="Search chats..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-vscode-input-bg text-vscode-input-fg border-vscode-border hover:border-vscode-border-hover focus:border-vscode-border-hover active:border-vscode-border-hover w-full rounded-full border px-4 py-2 text-xs transition-colors duration-150 focus:outline-none focus:ring-0 active:outline-none [&:not(:focus-visible)]:outline-none"
        />
        <svg
            className="text-vscode-input-fg absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    </div>
);
