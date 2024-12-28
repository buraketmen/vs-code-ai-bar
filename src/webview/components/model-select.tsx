import * as React from 'react';
import { useModelContext } from '../contexts/model-context';
import { AI_MODELS } from '../types/ai';

const ModelSelectComponent: React.FC = () => {
    const { selectedModel, setSelectedModel } = useModelContext();

    return (
        <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="w-full min-w-[64px] max-w-[112px] truncate rounded-sm border-none bg-vscode-bg-secondary py-1 text-xs opacity-50 outline-none hover:opacity-100 focus:outline-none focus:ring-0 focus-visible:outline-none [&_optgroup]:!font-semibold [&_option]:pl-0 [&_option]:!font-normal"
        >
            <optgroup label="ChatGPT">
                {AI_MODELS.chatgpt.map((model) => (
                    <option key={model} value={model} className="truncate">
                        {model}
                    </option>
                ))}
            </optgroup>
            <optgroup label="Claude">
                {AI_MODELS.claude.map((model) => (
                    <option key={model} value={model} className="truncate">
                        {model}
                    </option>
                ))}
            </optgroup>
        </select>
    );
};

export default React.memo(ModelSelectComponent);
