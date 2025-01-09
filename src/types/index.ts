export interface MarketData {
  price: number;
  volume_24h: number;
  price_change_24h: number;
  liquidity: {
    usd: number;
    token: number;
  };
  holder_data: {
    total: number;
    distribution: {
      whales: number;
      retail: number;
      institutions: number;
    };
  };
  trade_history: Array<{
    timestamp: number;
    price: number;
    volume: number;
    type: 'buy' | 'sell';
  }>;
}

export interface TradeSignal {
  symbol: string;
  price: number;
  direction: 'buy' | 'sell';
  confidence: number;
  timestamp: number;
  metadata: {
    source: string;
    strategy: string;
    indicators: {
      [key: string]: number | string | boolean;
    };
  };
}

export interface TokenPerformance {
  tokenAddress: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: {
    usd: number;
    token: number;
  };
  rapidDump: boolean;
  suspiciousVolume: boolean;
  holders: {
    total: number;
    distribution: {
      top10Percent: number;
      top50Percent: number;
      retail: number;
    };
  };
}

export interface ProcessedTokenData {
  security: {
    rugPull: boolean;
    isScam: boolean;
    honeypot: boolean;
    blacklisted: boolean;
    verified: boolean;
  };
  tradeData: {
    price: number;
    volume24h: number;
    priceChange24h: number;
    marketCap: number;
  };
  holderDistributionTrend: {
    whales: number;
    retail: number;
    institutions: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  highValueHolders: Array<{
    address: string;
    balance: number;
    lastActivity: number;
    type: 'whale' | 'institution' | 'retail';
  }>;
  recentTrades: Array<{
    timestamp: number;
    type: 'buy' | 'sell';
    amount: number;
    price: number;
  }>;
  dexScreenerData: {
    pairs: Array<{
      dex: string;
      liquidity: {
        usd: number;
        token: number;
      };
      volume24h: number;
      priceChange24h: number;
    }>;
  };
}

export interface CalculatedBuyAmounts {
  none: number;
  low: number;
  medium: number;
  high: number;
}

export interface HealthStatus {
  connection: boolean;
  wallet: boolean;
  orders: boolean;
  positions: boolean;
}