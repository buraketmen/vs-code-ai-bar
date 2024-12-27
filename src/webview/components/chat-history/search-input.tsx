import { Search } from 'lucide-react';
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
            className="w-full rounded-full border border-vscode-border bg-vscode-input-bg px-4 py-2 text-xs text-vscode-input-fg transition-colors duration-150 hover:border-vscode-border-hover focus:border-vscode-border-hover focus:outline-none focus:ring-0 active:border-vscode-border-hover active:outline-none [&:not(:focus-visible)]:outline-none"
        />
        <Search
            size={14}
            className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-vscode-input-fg opacity-40"
        />
    </div>
);
