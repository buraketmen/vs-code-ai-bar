import * as React from 'react';
import { AIModel, OPENAI_MODELS } from '../types/ai';
import { WebviewState } from '../types/vscode';

interface ModelContextType {
    selectedModel: AIModel;
    setSelectedModel: (model: AIModel) => void;
}

const ModelContext = React.createContext<ModelContextType | null>(null);

export const useModelContext = () => {
    const context = React.useContext(ModelContext);
    if (!context) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
};

interface ModelProviderProps {
    children: React.ReactNode;
    initialModel?: AIModel;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children, initialModel }) => {
    const [selectedModel, setSelectedModel] = React.useState<AIModel>(() => {
        const state = window.vscode.getState() as WebviewState;
        return initialModel || state?.selectedModel || OPENAI_MODELS.GPT4;
    });

    const handleSetSelectedModel = React.useCallback((model: AIModel) => {
        setSelectedModel(model);
        const currentState = (window.vscode.getState() as WebviewState) || {};
        window.vscode.setState({ ...currentState, selectedModel: model });
    }, []);

    const value = React.useMemo(
        () => ({
            selectedModel,
            setSelectedModel: handleSetSelectedModel,
        }),
        [selectedModel, handleSetSelectedModel]
    );

    return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
};
