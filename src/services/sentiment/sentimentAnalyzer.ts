import { SentimentData, ModelConfig, SocialMediaMetrics } from '../../types';
import { EmotionalMemory } from '../memory/emotionalMemory';

export class SentimentAnalyzer {
  private emotionalMemory: EmotionalMemory;
  private modelConfig: ModelConfig;

  constructor(modelConfig: ModelConfig) {
    this.emotionalMemory = new EmotionalMemory();
    this.modelConfig = modelConfig;
  }

  async analyzeSentiment(source: string, content: string): Promise<SentimentData> {
    // 构建情感分析提示词
    const prompt = this.buildSentimentAnalysisPrompt(source, content);

    // 调用AI模型进行分析
    const analysis = await this.callModel(prompt);

    // 解析模型输出
    const sentiment = this.parseModelOutput(analysis);

    // 计算社交媒体指标
    const metrics = await this.calculateSocialMetrics(source, content);

    // 构建情感数据
    const sentimentData: SentimentData = {
      id: `${source}-${Date.now()}`,
      source,
      type: this.getSentimentType(source),
      sentiment: sentiment.score,
      metadata: {
        influence: metrics.influence,
        reach: metrics.reach,
        urgency: this.calculateUrgency(sentiment.score, metrics),
        keywords: sentiment.keywords,
        topics: sentiment.topics,
        engagement: metrics.engagement
      }
    };

    // 存储情感数据
    await this.emotionalMemory.storeSentiment(sentimentData);

    return sentimentData;
  }

  private buildSentimentAnalysisPrompt(source: string, content: string): string {
    return `
Role: You are a market psychology expert specializing in behavioral finance.
Context: {
  "source": "${source}",
  "content": "${content.replace(/"/g, '\\"')}",
  "timestamp": "${new Date().toISOString()}"
}
Task: Analyze the sentiment and its potential market impact.
Requirements:
- Evaluate overall sentiment
- Identify key topics and keywords
- Assess potential market impact
- Consider source credibility
Output Format:
{
  "sentiment": {
    "score": -1.0 to 1.0,
    "confidence": 1-100,
    "keywords": [],
    "topics": []
  },
  "impact": {
    "immediacy": 1-10,
    "duration": "short/medium/long",
    "scope": "narrow/broad"
  }
}`;
  }

  private async callModel(prompt: string): Promise<string> {
    // 实现模型调用逻辑
    // 这里需要根据实际使用的模型API进行实现
    return `{
      "sentiment": {
        "score": 0.75,
        "confidence": 85,
        "keywords": ["bullish", "growth", "innovation"],
        "topics": ["technology", "market trend"]
      },
      "impact": {
        "immediacy": 8,
        "duration": "medium",
        "scope": "broad"
      }
    }`;
  }

  private parseModelOutput(output: string): {
    score: number;
    confidence: number;
    keywords: string[];
    topics: string[];
  } {
    try {
      const result = JSON.parse(output);
      return {
        score: result.sentiment.score,
        confidence: result.sentiment.confidence,
        keywords: result.sentiment.keywords,
        topics: result.sentiment.topics
      };
    } catch (error) {
      throw new Error('Failed to parse model output');
    }
  }

  private async calculateSocialMetrics(source: string, content: string): Promise<SocialMediaMetrics> {
    // 这里应该实现实际的社交媒体指标计算
    // 可以调用社交媒体API获取实际数据
    return {
      engagement: this.calculateEngagement(content),
      reach: this.calculateReach(source),
      sentiment: 0,  // 这个值会被模型分析的结果替换
      influence: this.calculateInfluence(source)
    };
  }

  private calculateEngagement(content: string): number {
    // 基于内容特征计算可能的参与度
    const factors = {
      length: content.length,
      questions: (content.match(/\?/g) || []).length,
      mentions: (content.match(/@\w+/g) || []).length,
      hashtags: (content.match(/#\w+/g) || []).length,
      urls: (content.match(/https?:\/\/\S+/g) || []).length
    };

    return Math.min(
      10,
      factors.questions * 2 +
      factors.mentions * 1.5 +
      factors.hashtags * 1 +
      factors.urls * 1.5 +
      factors.length / 100
    );
  }

  private calculateReach(source: string): number {
    // 基于源的特征计算潜在影响范围
    const sourceWeights = {
      'twitter': 8,
      'reddit': 7,
      'news': 9,
      'blog': 6
    };

    return sourceWeights[source] || 5;
  }

  private calculateInfluence(source: string): number {
    // 基于源的可信度和影响力计算影响力分数
    const influenceWeights = {
      'verified': 2,
      'expert': 3,
      'institutional': 4,
      'regular': 1
    };

    // 这里应该实现实际的源分类逻辑
    const sourceType = this.classifySource(source);
    return influenceWeights[sourceType] || 1;
  }

  private calculateUrgency(sentiment: number, metrics: SocialMediaMetrics): number {
    // 基于情感强度和社交指标计算紧急度
    const sentimentIntensity = Math.abs(sentiment);
    const urgency = (
      sentimentIntensity * 3 +
      metrics.influence * 2 +
      metrics.engagement * 2 +
      metrics.reach
    ) / 8;

    return Math.min(10, urgency);
  }

  private getSentimentType(source: string): 'social' | 'news' | 'market' {
    const sourceTypes = {
      'twitter': 'social',
      'reddit': 'social',
      'news': 'news',
      'bloomberg': 'news',
      'reuters': 'news',
      'trading': 'market',
      'exchange': 'market'
    };

    return sourceTypes[source] || 'social';
  }

  private classifySource(source: string): string {
    // 实现源分类逻辑
    const verifiedSources = ['bloomberg', 'reuters', 'wsj'];
    const expertSources = ['tradingview', 'seekingalpha'];
    const institutionalSources = ['goldman', 'jpmorgan'];

    if (verifiedSources.includes(source)) return 'verified';
    if (expertSources.includes(source)) return 'expert';
    if (institutionalSources.includes(source)) return 'institutional';
    return 'regular';
  }
}