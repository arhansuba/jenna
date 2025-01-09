import { MarketAnalysis, SentimentData, TwitterContent, ModelConfig } from '../../types';
import { EmotionalMemory } from '../memory/emotionalMemory';

export class ContentGenerator {
  private emotionalMemory: EmotionalMemory;
  private modelConfig: ModelConfig;

  constructor(modelConfig: ModelConfig) {
    this.emotionalMemory = new EmotionalMemory();
    this.modelConfig = modelConfig;
  }

  async generateContent(
    marketAnalysis: MarketAnalysis,
    sentimentData: SentimentData
  ): Promise<TwitterContent> {
    // 构建内容生成提示词
    const prompt = this.buildContentGenerationPrompt(marketAnalysis, sentimentData);

    // 调用AI模型生成内容
    const content = await this.callModel(prompt);

    // 解析模型输出
    return this.parseModelOutput(content);
  }

  private buildContentGenerationPrompt(
    marketAnalysis: MarketAnalysis,
    sentimentData: SentimentData
  ): string {
    return `
Role: You are a market influencer with deep trading knowledge and strong communication skills.
Context: {
  "marketAnalysis": {
    "trend": "${marketAnalysis.trend}",
    "strength": ${marketAnalysis.strength},
    "support": ${JSON.stringify(marketAnalysis.support)},
    "resistance": ${JSON.stringify(marketAnalysis.resistance)},
    "signals": ${JSON.stringify(marketAnalysis.signals)}
  },
  "sentimentData": {
    "sentiment": ${sentimentData.sentiment},
    "keywords": ${JSON.stringify(sentimentData.metadata.keywords)},
    "topics": ${JSON.stringify(sentimentData.metadata.topics)}
  }
}
Task: Generate engaging social media content about market conditions and trading decisions.
Requirements:
- Create informative yet engaging content
- Include relevant data and analysis
- Maintain professional tone
- Use appropriate hashtags
- Consider audience engagement
Output Format: {
  "mainTweet": {
    "content": string (max 280 chars),
    "hashtags": string[],
    "mentions": string[],
    "mediaType": "text/chart/video"
  },
  "thread": [
    {
      "content": string,
      "type": "analysis/data/conclusion",
      "mediaType": "text/chart/video"
    }
  ],
  "engagement": {
    "callToAction": string,
    "pollOptions": string[],
    "discussionTopics": string[]
  }
}`;
  }

  private async callModel(prompt: string): Promise<string> {
    // 实现模型调用逻辑
    // 这里需要根据实际使用的模型API进行实现
    return `{
      "mainTweet": {
        "content": "Market Analysis: $BTC showing strong bullish momentum with key support at $45K. Technical indicators and sentiment analysis suggest potential breakout. Thread 🧵👇 #Bitcoin #Crypto #Trading",
        "hashtags": ["Bitcoin", "Crypto", "Trading"],
        "mentions": [],
        "mediaType": "chart"
      },
      "thread": [
        {
          "content": "Technical Analysis:\\n- RSI: 65 (bullish)\\n- MACD: positive crossover\\n- Support: $45K\\n- Resistance: $48K\\n\\nVolume increasing with price action, confirming trend strength. 📈",
          "type": "analysis",
          "mediaType": "chart"
        },
        {
          "content": "Sentiment Analysis:\\n- Social media sentiment: highly positive\\n- News coverage: neutral to positive\\n- Institutional interest growing\\n\\nOverall market psychology supports bullish outlook. 📊",
          "type": "data",
          "mediaType": "text"
        },
        {
          "content": "Key Takeaways:\\n1. Strong technical setup\\n2. Positive sentiment\\n3. Increasing institutional interest\\n\\nWatch $48K resistance level for potential breakout confirmation. Stay tuned for updates! 🎯",
          "type": "conclusion",
          "mediaType": "text"
        }
      ],
      "engagement": {
        "callToAction": "What's your price target for $BTC this week? Vote below! 🗳️",
        "pollOptions": ["$45K-$48K", "$48K-$50K", "$50K-$52K", "> $52K"],
        "discussionTopics": [
          "Technical Analysis",
          "Market Sentiment",
          "Price Targets",
          "Risk Management"
        ]
      }
    }`;
  }

  private parseModelOutput(output: string): TwitterContent {
    try {
      const result = JSON.parse(output);
      return {
        mainTweet: {
          content: this.formatTweetContent(result.mainTweet.content),
          hashtags: result.mainTweet.hashtags,
          mentions: result.mainTweet.mentions
        },
        thread: result.thread.map(tweet => ({
          content: this.formatTweetContent(tweet.content),
          type: tweet.type
        }))
      };
    } catch (error) {
      throw new Error('Failed to parse model output');
    }
  }

  private formatTweetContent(content: string): string {
    // 格式化推文内容
    return content
      .replace(/\\n/g, '\n')  // 处理换行符
      .slice(0, 280);         // Twitter字符限制
  }

  private async enrichContent(content: TwitterContent): Promise<TwitterContent> {
    // 增强内容的互动性
    const enrichedContent = { ...content };

    // 添加相关标签
    const additionalHashtags = await this.getRelevantHashtags(content.mainTweet.content);
    enrichedContent.mainTweet.hashtags = [
      ...new Set([...content.mainTweet.hashtags, ...additionalHashtags])
    ];

    // 添加相关提及
    const relevantMentions = await this.getRelevantMentions(content.mainTweet.content);
    enrichedContent.mainTweet.mentions = [
      ...new Set([...content.mainTweet.mentions, ...relevantMentions])
    ];

    return enrichedContent;
  }

  private async getRelevantHashtags(content: string): Promise<string[]> {
    // 实现相关标签推荐逻辑
    const commonHashtags = {
      'bitcoin': ['crypto', 'btc', 'cryptocurrency'],
      'ethereum': ['eth', 'defi', 'blockchain'],
      'trading': ['cryptotrading', 'investment', 'finance']
    };

    const relevantTags = [];
    for (const [key, tags] of Object.entries(commonHashtags)) {
      if (content.toLowerCase().includes(key)) {
        relevantTags.push(...tags);
      }
    }

    return relevantTags;
  }

  private async getRelevantMentions(content: string): Promise<string[]> {
    // 实现相关提及推荐逻辑
    const relevantAccounts = {
      'bitcoin': ['@bitcoin', '@cz_binance'],
      'ethereum': ['@VitalikButerin', '@ethereumJoseph'],
      'defi': ['@DefiPulse', '@DefiantNews']
    };

    const mentions = [];
    for (const [key, accounts] of Object.entries(relevantAccounts)) {
      if (content.toLowerCase().includes(key)) {
        mentions.push(...accounts);
      }
    }

    return mentions;
  }
}