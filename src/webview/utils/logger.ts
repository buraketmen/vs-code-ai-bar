import { createMessage, VSCodeMessageType } from '../types/events';

export const logDebug = (message: any) => {
    window.vscode.postMessage(
        createMessage(VSCodeMessageType.LOG, { message: JSON.stringify(message), level: 'debug' })
    );
};

export const logError = (message: any) => {
    window.vscode.postMessage(
        createMessage(VSCodeMessageType.ERROR, { message: JSON.stringify(message), level: 'error' })
    );
};
