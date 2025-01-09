import { ModelProfile, TaskDefinition, ModelProviderName, ModelClass } from "../../types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export class ModelCoordinator {
    private modelProfiles: ModelProfile[] = [];
    private taskDefinitions: TaskDefinition[] = [];
    private apiKeys: Record<ModelProviderName, string> = {
        [ModelProviderName.OPENAI]: process.env.OPENAI_API_KEY || "",
        [ModelProviderName.ANTHROPIC]: process.env.ANTHROPIC_API_KEY || "",
        [ModelProviderName.GOOGLE]: process.env.GOOGLE_API_KEY || "",
        [ModelProviderName.LLAMACLOUD]: process.env.LLAMA_API_KEY || "",
        [ModelProviderName.TOGETHER]: process.env.TOGETHER_API_KEY || "",
    };

    async initialize(): Promise<void> {
        // Validate API keys for default models
        if (!this.apiKeys[ModelProviderName.OPENAI]) {
            console.warn("OpenAI API key not found in environment variables");
        }
        if (!this.apiKeys[ModelProviderName.ANTHROPIC]) {
            console.warn("Anthropic API key not found in environment variables");
        }

        // Add default model profiles
        this.addModelProfile({
            provider: ModelProviderName.OPENAI,
            capabilities: ["reasoning", "creativity", "knowledge"],
            costPerToken: 0.002,
            maxTokens: 4096,
            averageLatency: 1000,
            modelClass: ModelClass.LARGE
        });

        this.addModelProfile({
            provider: ModelProviderName.ANTHROPIC,
            capabilities: ["reasoning", "creativity", "analysis"],
            costPerToken: 0.001,
            maxTokens: 8192,
            averageLatency: 1200,
            modelClass: ModelClass.LARGE
        });
    }

    addModelProfile(profile: ModelProfile): void {
        this.modelProfiles.push(profile);
    }

    addTaskDefinition(definition: TaskDefinition): void {
        this.taskDefinitions.push(definition);
    }

    async selectModelsForTask(
        taskName: string,
        minModels: number,
        maxModels: number
    ): Promise<ModelProfile[]> {
        const taskDef = this.taskDefinitions.find(def => def.name === taskName);
        if (!taskDef) {
            throw new Error(`Task definition not found: ${taskName}`);
        }

        // Filter models by required capabilities and model class
        const eligibleModels = this.modelProfiles.filter(model => {
            const hasRequiredCapabilities = taskDef.requiredCapabilities.every(
                cap => model.capabilities.includes(cap)
            );
            return hasRequiredCapabilities && model.modelClass === taskDef.modelClass;
        });

        if (eligibleModels.length < minModels) {
            throw new Error(`Not enough eligible models for task: ${taskName}`);
        }

        // Sort models by cost and latency
        const sortedModels = [...eligibleModels].sort((a, b) => {
            const costScore = a.costPerToken - b.costPerToken;
            const latencyScore = (a.averageLatency - b.averageLatency) / 1000;
            return costScore + latencyScore;
        });

        // Select top N models where N is between minModels and maxModels
        const numModels = Math.min(
            Math.max(minModels, Math.ceil(sortedModels.length / 2)),
            maxModels
        );
        return sortedModels.slice(0, numModels);
    }

    async executeWithModel(
        model: ModelProfile,
        input: string
    ): Promise<{
        model: ModelProfile;
        result: string;
        confidence: number;
    }> {
        try {
            const apiKey = this.apiKeys[model.provider];
            if (!apiKey) {
                throw new Error(`API key not found for provider: ${model.provider}`);
            }

            let response;
            switch (model.provider) {
                case ModelProviderName.OPENAI:
                    response = await this.callOpenAI(input, apiKey);
                    break;
                case ModelProviderName.ANTHROPIC:
                    response = await this.callAnthropic(input, apiKey);
                    break;
                case ModelProviderName.GOOGLE:
                    response = await this.callGoogle(input, apiKey);
                    break;
                default:
                    response = await this.simulateModelResponse(model, input);
            }

            return {
                model,
                result: response.result,
                confidence: response.confidence
            };
        } catch (error) {
            throw new Error(`Failed to execute with model ${model.provider}: ${error}`);
        }
    }

    private async callOpenAI(input: string, apiKey: string): Promise<{ result: string; confidence: number }> {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "user", content: input }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return {
                result: data.choices[0].message.content,
                confidence: 0.9 // OpenAI doesn't provide confidence scores, using a high default
            };
        } catch (error) {
            throw new Error(`OpenAI API call failed: ${error}`);
        }
    }

    private async callAnthropic(input: string, apiKey: string): Promise<{ result: string; confidence: number }> {
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-2",
                    messages: [{ role: "user", content: input }],
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            return {
                result: data.content[0].text,
                confidence: 0.85 // Anthropic doesn't provide confidence scores, using a high default
            };
        } catch (error) {
            throw new Error(`Anthropic API call failed: ${error}`);
        }
    }

    private async callGoogle(input: string, apiKey: string): Promise<{ result: string; confidence: number }> {
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: input }] }]
                })
            });

            const data = await response.json();
            return {
                result: data.candidates[0].content.parts[0].text,
                confidence: 0.88 // Google doesn't provide confidence scores, using a high default
            };
        } catch (error) {
            throw new Error(`Google API call failed: ${error}`);
        }
    }

    private async simulateModelResponse(
        model: ModelProfile,
        input: string
    ): Promise<{ result: string; confidence: number }> {
        // Fallback to simulation for unsupported providers
        await new Promise(resolve => setTimeout(resolve, model.averageLatency));
        return {
            result: `Response from ${model.provider} for input: ${input}`,
            confidence: 0.7 + Math.random() * 0.3
        };
    }
}