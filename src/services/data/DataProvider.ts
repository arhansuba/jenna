import { Connection } from '@solana/web3.js';
import axios from 'axios';
import {
  MarketData,
  ProcessedTokenData,
  TokenPerformance
} from '../../types';

export class DataProvider {
  private connection: Connection;
  private dexScreenerApiKey: string;
  private etherscanApiKey: string;

  constructor(
    connection: Connection,
    config: {
      dexScreenerApiKey: string;
      etherscanApiKey: string;
    }
  ) {
    this.connection = connection;
    this.dexScreenerApiKey = config.dexScreenerApiKey;
    this.etherscanApiKey = config.etherscanApiKey;
  }

  async fetchTokenData(tokenAddress: string): Promise<ProcessedTokenData> {
    try {
      const [
        securityData,
        tradeData,
        holderData,
        dexData
      ] = await Promise.all([
        this.fetchSecurityData(tokenAddress),
        this.fetchTradeData(tokenAddress),
        this.fetchHolderData(tokenAddress),
        this.fetchDexScreenerData(tokenAddress)
      ]);

      const recentTrades = await this.fetchRecentTrades(tokenAddress);
      const holderDistribution = this.analyzeHolderDistribution(holderData);

      return {
        security: securityData,
        tradeData: tradeData,
        holderDistributionTrend: holderDistribution,
        highValueHolders: await this.identifyHighValueHolders(tokenAddress),
        recentTrades: recentTrades,
        dexScreenerData: dexData
      };
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw error;
    }
  }

  private async fetchSecurityData(tokenAddress: string) {
    const goPlus = await axios.get(
      `https://api.gopluslabs.io/api/v1/token_security/${tokenAddress}`
    );
    const rugDoc = await axios.get(
      `https://api.rugdoc.io/token/${tokenAddress}`
    );

    return {
      rugPull: this.analyzeRugPullRisk(goPlus.data, rugDoc.data),
      isScam: this.analyzeScamRisk(goPlus.data, rugDoc.data),
      honeypot: goPlus.data.honeypot_risk || rugDoc.data.honeypot,
      blacklisted: goPlus.data.blacklist || rugDoc.data.blacklisted,
      verified: goPlus.data.verified_contract || rugDoc.data.verified
    };
  }

  private async fetchTradeData(tokenAddress: string) {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.dexScreenerApiKey
        }
      }
    );

    const pair = response.data.pairs[0];
    return {
      price: parseFloat(pair.priceUsd),
      volume24h: parseFloat(pair.volume24h),
      priceChange24h: parseFloat(pair.priceChange24h),
      marketCap: parseFloat(pair.marketCap)
    };
  }

  private async fetchHolderData(tokenAddress: string) {
    const response = await axios.get(
      `https://api.etherscan.io/api`,
      {
        params: {
          module: 'token',
          action: 'tokenholderlist',
          contractaddress: tokenAddress,
          apikey: this.etherscanApiKey
        }
      }
    );

    return response.data.result;
  }

  private async fetchDexScreenerData(tokenAddress: string) {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.dexScreenerApiKey
        }
      }
    );

    return {
      pairs: response.data.pairs.map(pair => ({
        dex: pair.dexId,
        liquidity: {
          usd: parseFloat(pair.liquidity.usd),
          token: parseFloat(pair.liquidity.token)
        },
        volume24h: parseFloat(pair.volume24h),
        priceChange24h: parseFloat(pair.priceChange24h)
      }))
    };
  }

  private async fetchRecentTrades(tokenAddress: string) {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/trades/${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': this.dexScreenerApiKey
        }
      }
    );

    return response.data.trades.map(trade => ({
      timestamp: trade.timestamp,
      type: trade.type,
      amount: parseFloat(trade.amount),
      price: parseFloat(trade.priceUsd)
    }));
  }

  private async identifyHighValueHolders(tokenAddress: string) {
    const holders = await this.fetchHolderData(tokenAddress);
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.balance), 0);

    return holders
      .filter(holder => {
        const balance = parseFloat(holder.balance);
        const percentage = balance / totalSupply;
        return percentage > 0.01; // 持有超过1%的视为高价值持有者
      })
      .map(holder => ({
        address: holder.address,
        balance: parseFloat(holder.balance),
        lastActivity: holder.lastActivity,
        type: this.categorizeHolder(holder.balance, totalSupply)
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 100); // 只返回前100个高价值持有者
  }

  private analyzeHolderDistribution(holders: any[]) {
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.balance), 0);
    const distributions = holders.reduce(
      (acc, holder) => {
        const balance = parseFloat(holder.balance);
        const percentage = balance / totalSupply;

        if (percentage > 0.05) acc.whales++;
        else if (percentage > 0.01) acc.institutions++;
        else acc.retail++;

        return acc;
      },
      { whales: 0, institutions: 0, retail: 0 }
    );

    // 分析趋势
    const trend = this.analyzeTrend(holders);

    return {
      ...distributions,
      trend
    };
  }

  private analyzeTrend(holders: any[]): 'increasing' | 'decreasing' | 'stable' {
    // 基于最近24小时的持有者变化分析趋势
    const recentChanges = holders
      .filter(h => h.lastActivity > Date.now() - 24 * 60 * 60 * 1000)
      .reduce((acc, h) => acc + (h.isIncrease ? 1 : -1), 0);

    if (recentChanges > 10) return 'increasing';
    if (recentChanges < -10) return 'decreasing';
    return 'stable';
  }

  private categorizeHolder(
    balance: number,
    totalSupply: number
  ): 'whale' | 'institution' | 'retail' {
    const percentage = balance / totalSupply;
    if (percentage > 0.05) return 'whale';
    if (percentage > 0.01) return 'institution';
    return 'retail';
  }

  private analyzeRugPullRisk(
    goPlusData: any,
    rugDocData: any
  ): boolean {
    const riskFactors = [
      goPlusData.owner_change_risk,
      goPlusData.high_concentration,
      rugDocData.high_risk_factors,
      goPlusData.mint_risk,
      rugDocData.mint_risk
    ];

    return riskFactors.filter(Boolean).length >= 2;
  }

  private analyzeScamRisk(
    goPlusData: any,
    rugDocData: any
  ): boolean {
    const riskFactors = [
      goPlusData.scam_reports,
      rugDocData.scam_reports,
      goPlusData.suspicious_contracts,
      rugDocData.suspicious_activity
    ];

    return riskFactors.filter(Boolean).length >= 2;
  }
}