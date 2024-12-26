import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ChatProvider, useChatContext } from './contexts/chat-context';
import './styles.css';

declare global {
    function acquireVsCodeApi(): {
        postMessage(message: any): void;
        setState(state: any): void;
        getState(): any;
    };
    interface Window {
        vscode: {
            postMessage(message: any): void;
            setState(state: any): void;
            getState(): any;
        };
    }
}

// Initialize VS Code API
const vscode = acquireVsCodeApi();
window.vscode = vscode;

const UndoRedoHandler: React.FC = () => {
    const { canUndo, canRedo, undoDelete, redoDelete } = useChatContext();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                if (e.shiftKey && canRedo) {
                    e.preventDefault();
                    redoDelete();
                } else if (canUndo) {
                    e.preventDefault();
                    undoDelete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undoDelete, redoDelete]);

    return null;
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <ChatProvider>
        <UndoRedoHandler />
        <App />
    </ChatProvider>
);
