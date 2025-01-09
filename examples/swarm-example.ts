import { SwarmService } from "../packages/core/src/services/swarm/SwarmService";
import { ModelClass } from "../packages/core/src/types";
import * as fs from "fs";
import * as path from "path";

async function runSwarmExample() {
    try {
        // Create and initialize swarm service
        const swarmService = new SwarmService();
        await swarmService.initialize();

        // Load configuration from file
        const configPath = path.join(__dirname, "swarm-config.json");
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        // Update swarm configuration
        swarmService.updateConfig(config.swarm);

        // Add model profiles from config
        config.swarm.modelProfiles.forEach((profile: any) => {
            swarmService.addModelProfile({
                ...profile,
                modelClass: ModelClass[profile.modelClass.toUpperCase()]
            });
        });

        // Add task definitions from config
        config.swarm.taskDefinitions.forEach((task: any) => {
            swarmService.addTaskDefinition({
                ...task,
                modelClass: ModelClass[task.modelClass.toUpperCase()]
            });
        });

        // Example tasks to run
        const tasks = [
            {
                name: "text_generation",
                input: "Write a short story about a robot learning to paint."
            },
            {
                name: "analysis",
                input: "Analyze the impact of artificial intelligence on creative industries."
            },
            {
                name: "knowledge_query",
                input: "Explain the concept of quantum entanglement."
            }
        ];

        // Execute tasks and log results
        for (const task of tasks) {
            console.log(`\nExecuting task: ${task.name}`);
            console.log(`Input: ${task.input}`);

            try {
                const result = await swarmService.executeSwarmTask(task);
                console.log("\nResults:");
                console.log("-------------------------");
                console.log(`Result: ${result.result}`);
                console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
                console.log(`Agreement: ${(result.agreement * 100).toFixed(2)}%`);
                console.log(`Reliability: ${(result.reliability * 100).toFixed(2)}%`);
                console.log("Model Distribution:");
                Object.entries(result.modelDistribution).forEach(([model, count]) => {
                    console.log(`  ${model}: ${count} responses`);
                });
                console.log(`Execution Time: ${result.executionTime}ms`);
            } catch (error) {
                console.error(`Error executing task ${task.name}:`, error);
            }
        }
    } catch (error) {
        console.error("Error running swarm example:", error);
    }
}

// Run the example
runSwarmExample().catch(console.error);