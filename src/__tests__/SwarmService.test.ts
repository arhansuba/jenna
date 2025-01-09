import { SwarmService } from '../services/SwarmService';
import { SwarmConfig, MarketData } from '../types';

describe('SwarmService', () => {
  let swarmService: SwarmService;
  const mockConfig: SwarmConfig = {
    minModels: 2,
    maxModels: 3,
    votingThreshold: 0.6,
    defaultTimeout: 5000,
  };

  beforeEach(() => {
    swarmService = new SwarmService(mockConfig);
  });

  describe('processMarketUpdate', () => {
    it('should process market data and return analysis result', async () => {
      const marketData: MarketData = {
        symbol: 'BTC',
        price: 45000,
        volume: 1000000,
        timestamp: new Date(),
        indicators: {
          rsi: 65,
          macd: 100,
          volume_ma: 950000,
        },
      };

      const result = await swarmService.processMarketUpdate(marketData);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.modelDistribution).toBeDefined();
    });

    it('should handle invalid market data', async () => {
      const invalidMarketData = {
        symbol: 'BTC',
        // Missing required fields
      };

      await expect(
        swarmService.processMarketUpdate(invalidMarketData as MarketData)
      ).rejects.toThrow();
    });
  });

  describe('processSocialMediaUpdate', () => {
    it('should process social media content and return sentiment analysis', async () => {
      const platform = 'twitter';
      const content = 'Bitcoin showing strong momentum with increasing institutional adoption.';

      const result = await swarmService.processSocialMediaUpdate(platform, content);

      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.impact).toBeDefined();
    });

    it('should handle empty content', async () => {
      const platform = 'twitter';
      const content = '';

      await expect(
        swarmService.processSocialMediaUpdate(platform, content)
      ).rejects.toThrow();
    });
  });

  describe('processNewsUpdate', () => {
    it('should process news content and return analysis', async () => {
      const source = 'bloomberg';
      const content = 'Major financial institution announces Bitcoin ETF approval.';

      const result = await swarmService.processNewsUpdate(source, content);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.impact).toBeDefined();
    });

    it('should handle invalid news source', async () => {
      const source = 'invalid-source';
      const content = 'Some news content';

      await expect(
        swarmService.processNewsUpdate(source, content)
      ).rejects.toThrow();
    });
  });

  describe('model selection', () => {
    it('should select appropriate number of models within configured range', async () => {
      const marketData: MarketData = {
        symbol: 'BTC',
        price: 45000,
        volume: 1000000,
        timestamp: new Date(),
        indicators: {
          rsi: 65,
          macd: 100,
          volume_ma: 950000,
        },
      };

      const result = await swarmService.processMarketUpdate(marketData);

      expect(result.modelDistribution.length).toBeGreaterThanOrEqual(mockConfig.minModels);
      expect(result.modelDistribution.length).toBeLessThanOrEqual(mockConfig.maxModels);
    });
  });

  describe('result aggregation', () => {
    it('should aggregate results with appropriate confidence scores', async () => {
      const marketData: MarketData = {
        symbol: 'BTC',
        price: 45000,
        volume: 1000000,
        timestamp: new Date(),
        indicators: {
          rsi: 65,
          macd: 100,
          volume_ma: 950000,
        },
      };

      const result = await swarmService.processMarketUpdate(marketData);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.agreement).toBeDefined();
      expect(result.reliability).toBeDefined();
    });
  });
});