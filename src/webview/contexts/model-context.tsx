import * as React from 'react';
import { AI_MODELS, AIModel } from '../types';

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

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedModel, setSelectedModel] = React.useState<AIModel>(() => {
        const state = window.vscode.getState();
        return (state?.selectedModel as AIModel) || AI_MODELS.chatgpt[0];
    });

    const handleSetSelectedModel = React.useCallback((model: AIModel) => {
        setSelectedModel(model);
        window.vscode.setState({ ...window.vscode.getState(), selectedModel: model });
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
