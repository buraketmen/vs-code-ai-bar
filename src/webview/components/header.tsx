import * as React from 'react';

const HeaderComponent: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-4 opacity-50">
            <div className="mr-2 text-xl">🤖</div>
            <div className="flex items-center">This is a extension example for AI Bar</div>
        </div>
    );
};

export const Header = React.memo(HeaderComponent);
