// Swarm Configuration
export interface SwarmConfig {
  minModels: number;
  maxModels: number;
  votingThreshold: number;
  defaultTimeout: number;
}

// Model Types
export interface ModelResult {
  provider: string;
  result: string;
  confidence: number;
  metadata?: {
    latency: number;
    tokenCount: number;
  };
}

export interface ModelProfile {
  provider: string;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
  averageLatency: number;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  indicators: {
    rsi: number;
    macd: number;
    volume_ma: number;
    [key: string]: number;
  };
}

export interface MarketAnalysis {
  trend: {
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    timeframe: 'short' | 'medium' | 'long';
  };
  technicalAnalysis: {
    supportLevels: number[];
    resistanceLevels: number[];
    keyPatterns: string[];
    indicators: Record<string, number>;
  };
  tradingOpportunities: TradingOpportunity[];
  riskAssessment: {
    marketVolatility: number;
    liquidityRisk: number;
    overallRisk: number;
  };
}

export interface TradingOpportunity {
  type: 'entry' | 'exit';
  direction: 'long' | 'short';
  price: number;
  riskRewardRatio: number;
  confidence: number;
}

// Trading Types
export interface TradeData {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  performance?: {
    profitLoss: number;
    roi: number;
  };
}

export interface TradeSignal {
  symbol: string;
  action: 'buy' | 'sell';
  price: number;
  confidence: number;
  timestamp: Date;
}

// Sentiment Types
export interface SentimentData {
  source: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  timestamp: Date;
  impact: {
    price: number;
    volume: number;
    confidence: number;
  };
}

export interface SentimentAnalysis {
  overallSentiment: {
    direction: 'positive' | 'negative' | 'neutral';
    strength: number;
    confidence: number;
  };
  sentimentDrivers: {
    factor: string;
    impact: number;
    duration: 'short' | 'medium' | 'long';
  }[];
  marketImpact: {
    priceEffect: number;
    volumeEffect: number;
    volatilityEffect: number;
  };
}

// Social Media Types
export interface TwitterContent {
  mainTweet: {
    content: string;
    hashtags: string[];
    mentions: string[];
    mediaType: 'text' | 'chart' | 'video';
  };
  thread?: {
    content: string;
    type: 'analysis' | 'data' | 'conclusion';
    mediaType: 'text' | 'chart' | 'video';
  }[];
  engagement: {
    callToAction: string;
    pollOptions?: string[];
    discussionTopics: string[];
  };
  scheduling: {
    timing: 'immediate' | 'scheduled';
    targetAudience: string[];
    expectedEngagement: number;
  };
}

// Memory Types
export interface MemoryRecord {
  id: string;
  type: 'trade' | 'sentiment' | 'analysis';
  data: any;
  timestamp: Date;
  tags: string[];
}

export interface MemoryQuery {
  type?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}