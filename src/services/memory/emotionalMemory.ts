import { Database } from 'sqlite3';
import { SentimentData, SentimentHistoryParams, MarketImpact } from '../../types';

export class EmotionalMemory {
  private db: Database;

  constructor() {
    this.db = new Database('data/db.sqlite');
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS sentiment (
        id TEXT PRIMARY KEY,
        timestamp DATETIME,
        source TEXT,
        type TEXT,
        sentiment REAL,
        impact REAL,
        metadata TEXT
      )
    `);
  }

  async storeSentiment(data: SentimentData) {
    const impact = await this.calculateMarketImpact(data);
    await this.db.run(`
      INSERT INTO sentiment (id, timestamp, source, type, sentiment, impact, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id,
      new Date(),
      data.source,
      data.type,
      data.sentiment,
      impact,
      JSON.stringify(data.metadata)
    ]);
  }

  async getSentimentHistory(params: SentimentHistoryParams) {
    const { source, startDate, endDate, limit } = params;
    const query = `
      SELECT * FROM sentiment
      WHERE source = ?
      AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    return new Promise((resolve, reject) => {
      this.db.all(query, [source, startDate, endDate, limit], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  private async calculateMarketImpact(data: SentimentData): Promise<number> {
    // 实现市场影响力计算逻辑
    const impact: MarketImpact = {
      priceEffect: 0,
      volumeEffect: 0,
      volatilityEffect: 0
    };

    // 获取历史情感数据
    const history = await this.getSentimentHistory({
      source: data.source,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天
      endDate: new Date(),
      limit: 100
    });

    if (history && history.length > 0) {
      // 计算情感变化趋势
      const sentimentTrend = history.reduce((acc, curr) => acc + curr.sentiment, 0) / history.length;

      // 计算价格影响
      impact.priceEffect = (data.sentiment - sentimentTrend) * data.metadata.influence;

      // 计算成交量影响
      impact.volumeEffect = Math.abs(data.sentiment - sentimentTrend) * data.metadata.reach;

      // 计算波动性影响
      const sentimentVolatility = Math.std(history.map(h => h.sentiment));
      impact.volatilityEffect = sentimentVolatility * data.metadata.urgency;
    }

    // 返回综合影响分数
    return (impact.priceEffect + impact.volumeEffect + impact.volatilityEffect) / 3;
  }

  async getAggregatedSentiment(timeframe: string = '1d'): Promise<number> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - this.getTimeframeMilliseconds(timeframe));

    const query = `
      SELECT AVG(sentiment) as avgSentiment
      FROM sentiment
      WHERE timestamp BETWEEN ? AND ?
    `;

    return new Promise((resolve, reject) => {
      this.db.get(query, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        resolve(row?.avgSentiment || 0);
      });
    });
  }

  private getTimeframeMilliseconds(timeframe: string): number {
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['1d'];
  }
}