import { Plugin, Service, ServiceType } from "@elizaos/core";
import { SwarmService } from "./SwarmService";
import { ModelCoordinator } from "./ModelCoordinator";
import { ModelResultAggregator } from "./ModelResultAggregator";

class SwarmServiceImpl extends Service {
    private swarmService: SwarmService;

    constructor() {
        super(ServiceType.SWARM);
        this.swarmService = new SwarmService();
    }

    async initialize(runtime: any) {
        // 从character配置中获取swarm配置
        const swarmConfig = runtime.character.settings?.swarm || {};

        // 更新swarm服务配置
        this.swarmService.updateConfig({
            minModels: swarmConfig.minModels || 2,
            maxModels: swarmConfig.maxModels || 5,
            votingThreshold: swarmConfig.votingThreshold || 0.6,
            defaultTimeout: swarmConfig.defaultTimeout || 30000
        });

        // 添加默认任务定义
        this.swarmService.addTaskDefinition({
            name: "text_generation",
            description: "Generate text based on input",
            requiredCapabilities: ["reasoning", "creativity"],
            modelClass: "LARGE"
        });

        // 从character配置中获取模型配置
        const modelProfiles = swarmConfig.modelProfiles || [];
        modelProfiles.forEach((profile: any) => {
            this.swarmService.addModelProfile(profile);
        });
    }

    async executeSwarmTask(task: any) {
        return this.swarmService.executeSwarmTask(task);
    }
}

export const swarmPlugin: Plugin = {
    name: "swarm",
    services: [new SwarmServiceImpl()],
    // 可以添加actions, evaluators等
};

// 重新导出相关类，以便其他模块使用
export { SwarmService } from "./SwarmService";
export { ModelCoordinator } from "./ModelCoordinator";
export { ModelResultAggregator } from "./ModelResultAggregator";