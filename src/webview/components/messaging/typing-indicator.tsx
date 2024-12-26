import * as React from 'react';

const TypingIndicatorComponent: React.FC = () => {
    return (
        <div className="flex items-center justify-start">
            <span className="animate-gradient text-xs">Thinking...</span>
        </div>
    );
};

export const TypingIndicator = React.memo(TypingIndicatorComponent);
