import * as React from 'react';

type EmptyStateProps = {
    searchQuery: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg
            className="text-vscode-foreground mb-3 h-5 w-5 opacity-60"
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
        <div className="text-xs opacity-60">No chats found</div>
        {searchQuery && (
            <div className="mt-1 text-[10px] opacity-40">Try different search terms</div>
        )}
    </div>
);
