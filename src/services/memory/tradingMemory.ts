import { Database } from 'sqlite3';
import { TradeData, TradeHistoryParams, PerformanceMetrics } from '../../types';

export class TradingMemory {
  private db: Database;

  constructor() {
    this.db = new Database('data/db.sqlite');
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        timestamp DATETIME,
        symbol TEXT,
        type TEXT,
        price REAL,
        amount REAL,
        performance REAL,
        metadata TEXT
      )
    `);
  }

  async storeTradeData(data: TradeData) {
    const performance = await this.calculatePerformance(data);
    await this.db.run(`
      INSERT INTO trades (id, timestamp, symbol, type, price, amount, performance, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.id,
      new Date(),
      data.symbol,
      data.type,
      data.price,
      data.amount,
      performance,
      JSON.stringify(data.metadata)
    ]);
  }

  async getTradeHistory(params: TradeHistoryParams) {
    const { symbol, startDate, endDate, limit } = params;
    const query = `
      SELECT * FROM trades
      WHERE symbol = ?
      AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    return new Promise((resolve, reject) => {
      this.db.all(query, [symbol, startDate, endDate, limit], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  private async calculatePerformance(data: TradeData): Promise<number> {
    // 实现性能计算逻辑
    const metrics: PerformanceMetrics = {
      profitLoss: 0,
      roi: 0,
      drawdown: 0
    };

    // 获取历史数据计算性能指标
    const history = await this.getTradeHistory({
      symbol: data.symbol,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天
      endDate: new Date(),
      limit: 100
    });

    // 计算性能指标
    if (history && history.length > 0) {
      // 计算盈亏
      metrics.profitLoss = data.type === 'sell'
        ? (data.price - history[0].price) * data.amount
        : 0;

      // 计算ROI
      metrics.roi = metrics.profitLoss / (history[0].price * data.amount) * 100;

      // 计算回撤
      const highestPrice = Math.max(...history.map(t => t.price));
      metrics.drawdown = ((highestPrice - data.price) / highestPrice) * 100;
    }

    // 返回综合性能分数
    return (metrics.roi - metrics.drawdown) / 2;
  }
}