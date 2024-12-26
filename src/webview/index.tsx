import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ChatProvider } from './contexts/chat-context';
import { ModelProvider } from './contexts/model-context';
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

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <ChatProvider>
        <ModelProvider>
            <App />
        </ModelProvider>
    </ChatProvider>
);
