import { ISwarmService, ServiceType, SwarmConfig, SwarmTask, SwarmResult, ModelProfile, TaskDefinition, ModelProviderName } from "../../types";
import { ModelCoordinator } from "./ModelCoordinator";
import { ModelResultAggregator } from "./ModelResultAggregator";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export class SwarmService implements ISwarmService {
    private modelCoordinator: ModelCoordinator;
    private resultAggregator: ModelResultAggregator;
    private config: SwarmConfig = {
        minModels: parseInt(process.env.SWARM_MIN_MODELS || "2"),
        maxModels: parseInt(process.env.SWARM_MAX_MODELS || "5"),
        votingThreshold: parseFloat(process.env.SWARM_VOTING_THRESHOLD || "0.6"),
        defaultTimeout: parseInt(process.env.SWARM_DEFAULT_TIMEOUT || "30000")
    };

    constructor() {
        this.modelCoordinator = new ModelCoordinator();
        this.resultAggregator = new ModelResultAggregator();

        // Validate configuration
        if (this.config.minModels < 1) {
            console.warn("SWARM_MIN_MODELS must be at least 1, setting to default: 2");
            this.config.minModels = 2;
        }
        if (this.config.maxModels < this.config.minModels) {
            console.warn(`SWARM_MAX_MODELS must be at least ${this.config.minModels}, adjusting to match`);
            this.config.maxModels = this.config.minModels;
        }
        if (this.config.votingThreshold <= 0 || this.config.votingThreshold > 1) {
            console.warn("SWARM_VOTING_THRESHOLD must be between 0 and 1, setting to default: 0.6");
            this.config.votingThreshold = 0.6;
        }
        if (this.config.defaultTimeout < 1000) {
            console.warn("SWARM_DEFAULT_TIMEOUT must be at least 1000ms, setting to default: 30000");
            this.config.defaultTimeout = 30000;
        }
    }

    get serviceType(): ServiceType {
        return ServiceType.SWARM;
    }

    async initialize(): Promise<void> {
        // Initialize model coordinator and result aggregator
        await this.modelCoordinator.initialize();

        // Log configuration
        console.log("Swarm Service Configuration:");
        console.log(`- Minimum Models: ${this.config.minModels}`);
        console.log(`- Maximum Models: ${this.config.maxModels}`);
        console.log(`- Voting Threshold: ${this.config.votingThreshold}`);
        console.log(`- Default Timeout: ${this.config.defaultTimeout}ms`);
    }

    updateConfig(config: Partial<SwarmConfig>): void {
        this.config = { ...this.config, ...config };
    }

    addModelProfile(profile: ModelProfile): void {
        this.modelCoordinator.addModelProfile(profile);
    }

    addTaskDefinition(definition: TaskDefinition): void {
        this.modelCoordinator.addTaskDefinition(definition);
    }

    async executeSwarmTask(task: SwarmTask): Promise<SwarmResult> {
        const startTime = Date.now();
        const taskConfig = { ...this.config, ...(task.config || {}) };

        // Select models for the task
        const selectedModels = await this.modelCoordinator.selectModelsForTask(
            task.name,
            taskConfig.minModels,
            taskConfig.maxModels
        );

        // Execute task with each model with timeout
        const modelResults = await Promise.all(
            selectedModels.map(model =>
                Promise.race([
                    this.modelCoordinator.executeWithModel(model, task.input),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout")), taskConfig.defaultTimeout)
                    )
                ]).catch(error => ({ error, model }))
            )
        );

        // Filter out errors and prepare results for aggregation
        const validResults = modelResults
            .filter(result => !('error' in result))
            .map(result => ({
                provider: (result as any).model.provider,
                result: (result as any).result,
                confidence: (result as any).confidence
            }));

        // Log errors if any
        const errors = modelResults.filter(result => 'error' in result);
        if (errors.length > 0) {
            console.warn(`${errors.length} models failed to execute:`,
                errors.map(e => `${(e as any).model.provider}: ${(e as any).error.message}`));
        }

        // Aggregate results
        const aggregatedResult = this.resultAggregator.aggregate(validResults, taskConfig.votingThreshold);

        // Calculate model distribution
        const modelDistribution = validResults.reduce((acc, curr) => {
            acc[curr.provider as ModelProviderName] = (acc[curr.provider as ModelProviderName] || 0) + 1;
            return acc;
        }, {} as Record<ModelProviderName, number>);

        // Calculate reliability based on successful responses
        const reliability = validResults.length / selectedModels.length;

        return {
            result: aggregatedResult.result,
            confidence: aggregatedResult.confidence,
            agreement: aggregatedResult.agreement,
            modelDistribution,
            reliability,
            executionTime: Date.now() - startTime
        };
    }
}