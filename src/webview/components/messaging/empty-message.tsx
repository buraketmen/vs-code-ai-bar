import * as React from 'react';

export const EmptyMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center opacity-80">
            <div className="mb-2 text-4xl">🤖</div>
            <div className="text-sm">
                <p className="mb-1">Welcome! I'm your AI coding assistant.</p>
                <p>Send a message to start our conversation.</p>
            </div>
        </div>
    );
};
