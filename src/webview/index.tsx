import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

function initReact() {
    try {
        const container = document.getElementById('root');
        if (!container) {
            throw new Error('Root container not found!');
        }

        // Remove loading message
        container.innerHTML = '';

        const root = createRoot(container);
        root.render(
            React.createElement(
                React.StrictMode,
                null,
                React.createElement('div', { style: {} }, React.createElement(App, null))
            )
        );
    } catch (error) {
        console.error('Failed to initialize React:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '20px';
        errorDiv.innerHTML = `<h2>Error</h2><pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
        document.body.appendChild(errorDiv);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReact);
} else {
    initReact();
}
