import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ChatProvider } from './contexts/chat-context';
import { ModelProvider } from './contexts/model-context';
import './styles.css';
import './vscode'; // Import the VS Code type definitions

// Initialize VS Code API
const vscode = acquireVsCodeApi();
window.vscode = vscode;

const root = document.getElementById('root');
if (!root) {
    throw new Error('Root element not found');
}

createRoot(root).render(
    <React.StrictMode>
        <ChatProvider>
            <ModelProvider>
                <App />
            </ModelProvider>
        </ChatProvider>
    </React.StrictMode>
);
