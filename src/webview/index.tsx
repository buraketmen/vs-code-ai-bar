import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ChatProvider } from './contexts/chat-context';
import { ModelProvider } from './contexts/model-context';
import './styles.css';
import './types/vscode'; // Import the VS Code type definitions

// Initialize VS Code API and get initial state
const vscode = acquireVsCodeApi();
const savedState = vscode.getState();

// Create initial state with a default chat if none exists
const defaultChat = {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
};

const state = {
    sessions: savedState?.sessions?.length ? savedState.sessions : [defaultChat],
    currentSessionId: savedState?.currentSessionId || defaultChat.id,
    selectedModel: savedState?.selectedModel,
};

window.vscode = vscode;

// Save initial state
vscode.setState(state);

const root = document.getElementById('root');
if (!root) {
    throw new Error('Root element not found');
}

createRoot(root).render(
    <React.StrictMode>
        <ChatProvider initialState={state}>
            <ModelProvider initialModel={state.selectedModel}>
                <App />
            </ModelProvider>
        </ChatProvider>
    </React.StrictMode>
);
