import { MarketAnalyzer } from './market/analysis/marketAnalyzer';
import { SentimentAnalyzer } from './sentiment/sentimentAnalyzer';
import { ContentGenerator } from './twitter/contentGenerator';
import { TradingMemory } from './memory/tradingMemory';
import { EmotionalMemory } from './memory/emotionalMemory';
import {
  MarketData,
  MarketAnalysis,
  SentimentData,
  TwitterContent,
  SwarmConfig,
  ModelConfig
} from '../types';

export class SwarmService {
  private marketAnalyzer: MarketAnalyzer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private contentGenerator: ContentGenerator;
  private tradingMemory: TradingMemory;
  private emotionalMemory: EmotionalMemory;
  private config: SwarmConfig;

  constructor(config: SwarmConfig) {
    this.config = config;

    // 初始化各个模型配置
    const marketModelConfig: ModelConfig = {
      name: 'gpt-4-32k',
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 4000,
      temperature: 0.7,
      capabilities: ['market_analysis', 'technical_analysis']
    };

    const sentimentModelConfig: ModelConfig = {
      name: 'claude-2',
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 2000,
      temperature: 0.5,
      capabilities: ['sentiment_analysis', 'news_analysis']
    };

    const contentModelConfig: ModelConfig = {
      name: 'gpt-4',
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 1000,
      temperature: 0.8,
      capabilities: ['content_generation', 'social_media']
    };

    // 初始化各个服务
    this.marketAnalyzer = new MarketAnalyzer(marketModelConfig);
    this.sentimentAnalyzer = new SentimentAnalyzer(sentimentModelConfig);
    this.contentGenerator = new ContentGenerator(contentModelConfig);
    this.tradingMemory = new TradingMemory();
    this.emotionalMemory = new EmotionalMemory();
  }

  async processMarketUpdate(marketData: MarketData): Promise<{
    analysis: MarketAnalysis;
    sentiment: SentimentData;
    content: TwitterContent;
  }> {
    try {
      // 1. 进行市场分析
      const marketAnalysis = await this.marketAnalyzer.analyzeMarket(marketData);

      // 2. 分析市场情绪
      const sentimentData = await this.sentimentAnalyzer.analyzeSentiment(
        'market',
        JSON.stringify({
          price: marketData.price,
          volume: marketData.volume,
          indicators: marketData.indicators,
          analysis: marketAnalysis
        })
      );

      // 3. 生成社交媒体内容
      const twitterContent = await this.contentGenerator.generateContent(
        marketAnalysis,
        sentimentData
      );

      // 4. 返回综合结果
      return {
        analysis: marketAnalysis,
        sentiment: sentimentData,
        content: twitterContent
      };
    } catch (error) {
      console.error('Error processing market update:', error);
      throw error;
    }
  }

  async processSocialMediaUpdate(source: string, content: string): Promise<{
    sentiment: SentimentData;
    content: TwitterContent;
  }> {
    try {
      // 1. 分析社交媒体情绪
      const sentimentData = await this.sentimentAnalyzer.analyzeSentiment(
        source,
        content
      );

      // 2. 获取最新的市场分析
      const marketData = await this.getLatestMarketData();
      const marketAnalysis = await this.marketAnalyzer.analyzeMarket(marketData);

      // 3. 生成回应内容
      const twitterContent = await this.contentGenerator.generateContent(
        marketAnalysis,
        sentimentData
      );

      // 4. 返回结果
      return {
        sentiment: sentimentData,
        content: twitterContent
      };
    } catch (error) {
      console.error('Error processing social media update:', error);
      throw error;
    }
  }

  async processNewsUpdate(source: string, content: string): Promise<{
    sentiment: SentimentData;
    content: TwitterContent;
  }> {
    try {
      // 1. 分析新闻情绪
      const sentimentData = await this.sentimentAnalyzer.analyzeSentiment(
        source,
        content
      );

      // 2. 获取最新的市场分析
      const marketData = await this.getLatestMarketData();
      const marketAnalysis = await this.marketAnalyzer.analyzeMarket(marketData);

      // 3. 生成新闻评论内容
      const twitterContent = await this.contentGenerator.generateContent(
        marketAnalysis,
        sentimentData
      );

      // 4. 返回结果
      return {
        sentiment: sentimentData,
        content: twitterContent
      };
    } catch (error) {
      console.error('Error processing news update:', error);
      throw error;
    }
  }

  private async getLatestMarketData(): Promise<MarketData> {
    // 实现获取最新市场数据的逻辑
    // 这里应该从实际的市场数据源获取数据
    return {
      symbol: 'BTC',
      price: 45000,
      volume: 1000000,
      timestamp: new Date(),
      indicators: {
        rsi: 65,
        macd: 100,
        volume_ma: 950000
      }
    };
  }

  // 辅助方法：检查是否需要更新分析
  private shouldUpdateAnalysis(lastUpdate: Date): boolean {
    const updateInterval = 5 * 60 * 1000; // 5分钟
    return Date.now() - lastUpdate.getTime() > updateInterval;
  }

  // 辅助方法：验证数据源
  private validateDataSource(source: string): boolean {
    const validSources = ['twitter', 'reddit', 'news', 'bloomberg', 'reuters'];
    return validSources.includes(source.toLowerCase());
  }

  // 辅助方法：检查情感分数是否显著
  private isSignificantSentiment(sentiment: number): boolean {
    const threshold = 0.3; // 情感分数阈值
    return Math.abs(sentiment) > threshold;
  }
}