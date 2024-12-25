import * as React from 'react';

const TypingIndicatorComponent: React.FC = () => {
    return (
        <div className="flex justify-start">
            <div className="bg-vscode-input-bg text-vscode-fg flex items-center space-x-2 rounded-lg p-3">
                <div className="bg-vscode-fg h-2 w-2 animate-bounce rounded-full" />
                <div className="bg-vscode-fg h-2 w-2 animate-bounce rounded-full delay-100" />
                <div className="bg-vscode-fg h-2 w-2 animate-bounce rounded-full delay-200" />
            </div>
        </div>
    );
};

export const TypingIndicator = React.memo(TypingIndicatorComponent);
