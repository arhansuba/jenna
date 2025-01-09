import { MarketData, TechnicalIndicators, MarketAnalysis, ModelConfig } from '../../../types';
import { TradingMemory } from '../../memory/tradingMemory';
import { EmotionalMemory } from '../../memory/emotionalMemory';

export class MarketAnalyzer {
  private tradingMemory: TradingMemory;
  private emotionalMemory: EmotionalMemory;
  private modelConfig: ModelConfig;

  constructor(modelConfig: ModelConfig) {
    this.tradingMemory = new TradingMemory();
    this.emotionalMemory = new EmotionalMemory();
    this.modelConfig = modelConfig;
  }

  async analyzeMarket(data: MarketData): Promise<MarketAnalysis> {
    const technicalIndicators = await this.calculateIndicators(data);
    const sentiment = await this.emotionalMemory.getAggregatedSentiment('1d');

    // 构建市场分析提示词
    const prompt = this.buildMarketAnalysisPrompt(data, technicalIndicators, sentiment);

    // 调用AI模型进行分析
    const analysis = await this.callModel(prompt);

    // 解析模型输出
    return this.parseModelOutput(analysis);
  }

  private async calculateIndicators(data: MarketData): Promise<TechnicalIndicators> {
    // 计算技术指标
    const prices = await this.getHistoricalPrices(data.symbol);

    return {
      sma: this.calculateSMA(prices, 20),
      ema: this.calculateEMA(prices, 20),
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices)
    };
  }

  private buildMarketAnalysisPrompt(
    data: MarketData,
    indicators: TechnicalIndicators,
    sentiment: number
  ): string {
    return `
Role: You are an expert quantitative analyst with deep knowledge in technical and fundamental analysis.
Context: {
  "marketData": {
    "symbol": "${data.symbol}",
    "price": ${data.price},
    "volume": ${data.volume},
    "timestamp": "${data.timestamp}"
  },
  "technicalIndicators": {
    "sma": ${JSON.stringify(indicators.sma)},
    "ema": ${JSON.stringify(indicators.ema)},
    "rsi": ${indicators.rsi},
    "macd": ${JSON.stringify(indicators.macd)}
  },
  "marketSentiment": ${sentiment}
}
Task: Analyze current market conditions and identify trading opportunities.
Requirements:
- Consider both technical and fundamental factors
- Identify key support/resistance levels
- Evaluate market trends and momentum
- Assess trading volume and liquidity
- Consider market sentiment impact
Output Format:
{
  "trend": "bullish/bearish/neutral",
  "strength": 1-10,
  "support": [],
  "resistance": [],
  "signals": [
    {
      "type": "entry/exit",
      "direction": "long/short",
      "confidence": 1-100
    }
  ]
}`;
  }

  private async callModel(prompt: string): Promise<string> {
    // 实现模型调用逻辑
    // 这里需要根据实际使用的模型API进行实现
    return '{"trend":"bullish","strength":8,"support":[100,95],"resistance":[110,115],"signals":[{"type":"entry","direction":"long","confidence":85}]}';
  }

  private parseModelOutput(output: string): MarketAnalysis {
    try {
      const result = JSON.parse(output);
      return {
        trend: result.trend,
        strength: result.strength,
        support: result.support,
        resistance: result.resistance,
        signals: result.signals
      };
    } catch (error) {
      throw new Error('Failed to parse model output');
    }
  }

  private async getHistoricalPrices(symbol: string): Promise<number[]> {
    const history = await this.tradingMemory.getTradeHistory({
      symbol,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      limit: 100
    });
    return history.map(trade => trade.price);
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema = [];
    const multiplier = 2 / (period + 1);

    // 第一个EMA值使用SMA
    ema[0] = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }

  private calculateRSI(prices: number[], period: number): number {
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { line: number[], signal: number[], histogram: number[] } {
    const shortEMA = this.calculateEMA(prices, 12);
    const longEMA = this.calculateEMA(prices, 26);

    const macdLine = shortEMA.map((value, index) => value - longEMA[index]);
    const signalLine = this.calculateEMA(macdLine, 9);
    const histogram = macdLine.map((value, index) => value - signalLine[index]);

    return {
      line: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }
}