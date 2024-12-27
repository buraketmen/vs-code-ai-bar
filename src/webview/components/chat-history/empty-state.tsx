import { Search } from 'lucide-react';
import * as React from 'react';

type EmptyStateProps = {
    searchQuery: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <Search size={18} className="text-vscode-foreground mb-3 opacity-60" />

        <div className="text-sm opacity-60">No chats found</div>
        {searchQuery && (
            <div className="mt-1 text-[10px] opacity-40">Try different search terms</div>
        )}
    </div>
);
