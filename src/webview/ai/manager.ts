import { Settings } from '../settings';
import { AIModel, CLAUDE_MODELS, ClaudeModel, OPENAI_MODELS, OpenAIModel } from '../types/ai';
import { BaseAI } from './base';
import { Claude } from './providers/claude';
import { OpenAI } from './providers/openai';

export class AIManager {
    private static instance: AIManager;
    private models: Map<AIModel, BaseAI>;
    private configDisposable: (() => void) | null = null;

    private constructor() {
        this.models = new Map();
        this.configDisposable = Settings.onConfigChange(() => this.updateAllModels());
    }

    private async updateAllModels() {
        const config = {
            temperature: await Settings.getTemperature(),
            maxTokens: await Settings.getMaxTokens(),
            maxHistoryLength: await Settings.getMaxHistoryLength(),
            maxContextMessages: await Settings.getMaxContextMessages(),
            openaiApiKey: await Settings.getOpenAIKey(),
            anthropicApiKey: await Settings.getAnthropicKey(),
        };

        for (const ai of this.models.values()) {
            ai.updateConfig(config);
        }
    }

    public static getInstance(): AIManager {
        if (!AIManager.instance) {
            AIManager.instance = new AIManager();
        }
        return AIManager.instance;
    }

    public static dispose() {
        if (AIManager.instance) {
            if (AIManager.instance.configDisposable) {
                AIManager.instance.configDisposable();
            }
            AIManager.instance = null as any;
        }
    }

    public static isOpenAIModel(model: AIModel): model is OpenAIModel {
        return model && Object.values(OPENAI_MODELS).includes(model as OpenAIModel);
    }

    public static isClaudeModel(model: AIModel): model is ClaudeModel {
        return model && Object.values(CLAUDE_MODELS).includes(model as ClaudeModel);
    }

    public async getModel(model: AIModel): Promise<BaseAI> {
        let ai = this.models.get(model);
        if (!ai) {
            const baseConfig = {
                temperature: await Settings.getTemperature(),
                maxTokens: await Settings.getMaxTokens(),
                maxHistoryLength: await Settings.getMaxHistoryLength(),
                maxContextMessages: await Settings.getMaxContextMessages(),
                openaiApiKey: await Settings.getOpenAIKey(),
                anthropicApiKey: await Settings.getAnthropicKey(),
            };

            if (AIManager.isOpenAIModel(model)) {
                ai = new OpenAI({ ...baseConfig, model });
            } else if (AIManager.isClaudeModel(model)) {
                ai = new Claude({ ...baseConfig, model });
            } else {
                throw new Error(`Unsupported model: ${model}`);
            }
            this.models.set(model, ai);
        }
        return ai;
    }
}
