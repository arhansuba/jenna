import { SwarmService } from './services/SwarmService';
import { SwarmConfig, MarketData } from './types';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
  // 创建 Swarm 配置
  const swarmConfig: SwarmConfig = {
    minModels: parseInt(process.env.SWARM_MIN_MODELS || '2'),
    maxModels: parseInt(process.env.SWARM_MAX_MODELS || '5'),
    votingThreshold: parseFloat(process.env.SWARM_VOTING_THRESHOLD || '0.6'),
    defaultTimeout: parseInt(process.env.SWARM_DEFAULT_TIMEOUT || '30000')
  };

  // 初始化 SwarmService
  const swarmService = new SwarmService(swarmConfig);

  try {
    // 示例 1: 处理市场数据更新
    console.log('Processing market update...');
    const marketData: MarketData = {
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

    const marketResult = await swarmService.processMarketUpdate(marketData);
    console.log('Market Analysis Result:', JSON.stringify(marketResult, null, 2));

    // 示例 2: 处理社交媒体更新
    console.log('\nProcessing social media update...');
    const socialMediaContent = `
      Bitcoin showing strong momentum with increasing institutional adoption.
      Technical indicators suggest potential breakout above $48K resistance.
      #Bitcoin #Crypto #Trading
    `;

    const socialResult = await swarmService.processSocialMediaUpdate(
      'twitter',
      socialMediaContent
    );
    console.log('Social Media Analysis Result:', JSON.stringify(socialResult, null, 2));

    // 示例 3: 处理新闻更新
    console.log('\nProcessing news update...');
    const newsContent = `
      Major financial institution announces Bitcoin ETF approval.
      Market experts predict significant impact on cryptocurrency adoption.
      Trading volume increases across major exchanges.
    `;

    const newsResult = await swarmService.processNewsUpdate(
      'bloomberg',
      newsContent
    );
    console.log('News Analysis Result:', JSON.stringify(newsResult, null, 2));

  } catch (error) {
    console.error('Error in example script:', error);
  }
}

// 运行示例
main().catch(console.error);