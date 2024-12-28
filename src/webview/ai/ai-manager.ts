import { AIModel, ChatGPTModel, ClaudeModel } from '../types/ai';
import { BaseAI } from './base-ai';
import { ChatGPT } from './chatgpt';
import { Claude } from './claude';

export class AIManager {
    private static instance: AIManager;
    private models: Map<AIModel, BaseAI>;

    private constructor() {
        this.models = new Map();
    }

    public static getInstance(): AIManager {
        if (!AIManager.instance) {
            AIManager.instance = new AIManager();
        }
        return AIManager.instance;
    }

    public getModel(model: AIModel): BaseAI {
        let ai = this.models.get(model);
        if (!ai) {
            if (model.startsWith('gpt')) {
                ai = new ChatGPT({ model: model as ChatGPTModel });
            } else if (model.startsWith('claude')) {
                ai = new Claude({ model: model as ClaudeModel });
            } else {
                throw new Error(`Unsupported model: ${model}`);
            }
            this.models.set(model, ai);
        }
        return ai;
    }
}
