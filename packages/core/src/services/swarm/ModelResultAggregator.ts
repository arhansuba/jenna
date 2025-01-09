import { ModelProviderName } from "../../types";

interface ModelResult {
    provider: ModelProviderName;
    result: string;
    confidence: number;
}

interface AggregatedResult {
    result: string;
    confidence: number;
    agreement: number;
}

export class ModelResultAggregator {
    aggregate(results: ModelResult[], votingThreshold: number): AggregatedResult {
        if (results.length === 0) {
            throw new Error("No results to aggregate");
        }

        // Group similar results
        const groupedResults = this.groupSimilarResults(results);

        // Find the group with the highest combined confidence
        let bestGroup = {
            results: [] as ModelResult[],
            combinedConfidence: 0
        };

        for (const group of groupedResults) {
            const combinedConfidence = group.reduce(
                (sum, result) => sum + result.confidence,
                0
            ) / group.length;

            if (combinedConfidence > bestGroup.combinedConfidence) {
                bestGroup = {
                    results: group,
                    combinedConfidence
                };
            }
        }

        // Calculate agreement score
        const agreement = bestGroup.results.length / results.length;

        // Only use the result if it meets the voting threshold
        if (agreement < votingThreshold) {
            // If no consensus, use the result with highest individual confidence
            const bestResult = results.reduce((best, current) =>
                current.confidence > best.confidence ? current : best
            );

            return {
                result: bestResult.result,
                confidence: bestResult.confidence,
                agreement: 1 / results.length
            };
        }

        return {
            result: bestGroup.results[0].result,
            confidence: bestGroup.combinedConfidence,
            agreement
        };
    }

    private groupSimilarResults(results: ModelResult[]): ModelResult[][] {
        const groups: ModelResult[][] = [];

        for (const result of results) {
            let addedToGroup = false;

            // Try to add to existing group
            for (const group of groups) {
                if (this.areSimilar(result.result, group[0].result)) {
                    group.push(result);
                    addedToGroup = true;
                    break;
                }
            }

            // Create new group if no similar results found
            if (!addedToGroup) {
                groups.push([result]);
            }
        }

        return groups;
    }

    private areSimilar(result1: string, result2: string): boolean {
        // Simple similarity check using Levenshtein distance
        const distance = this.levenshteinDistance(result1, result2);
        const maxLength = Math.max(result1.length, result2.length);
        const similarity = 1 - distance / maxLength;

        // Consider results similar if they have > 80% similarity
        return similarity > 0.8;
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const m = str1.length;
        const n = str2.length;
        const dp: number[][] = Array(m + 1)
            .fill(0)
            .map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) {
            dp[i][0] = i;
        }
        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] =
                        1 +
                        Math.min(
                            dp[i - 1][j], // deletion
                            dp[i][j - 1], // insertion
                            dp[i - 1][j - 1] // substitution
                        );
                }
            }
        }

        return dp[m][n];
    }
}