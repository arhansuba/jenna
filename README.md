# Eliza Trading Swarm

A framework for managing multiple AI models working collaboratively for quantitative and emotional trading.

## Features

- Multi-model collaboration through swarm architecture
- Dual memory system for trading and emotional data
- Real-time market analysis and sentiment tracking
- Automated trading execution with risk management
- Social media integration for market sentiment analysis
- Performance visualization and monitoring
- Adaptive model selection based on historical performance

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/eliza-trading-swarm.git
cd eliza-trading-swarm
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Build the project:
```bash
npm run build
```

5. Start the application:
```bash
npm start
```

## Core Components

### SwarmService
Manages the collaboration between multiple AI models, including:
- Model selection based on task requirements
- Result aggregation and consensus building
- Performance tracking and optimization

### Memory System
- TradingMemory: Stores and manages trading data
- EmotionalMemory: Handles sentiment and market impact data

### Market Analysis
- Technical indicator calculation
- Sentiment analysis integration
- Trading opportunity identification

### Trading Engine
- Order execution
- Risk management
- Position tracking

### Social Media Integration
- Twitter content generation
- Sentiment analysis
- Community engagement

## Configuration

The system can be configured through environment variables in the `.env` file:

- `SWARM_MIN_MODELS`: Minimum number of models to use for each task
- `SWARM_MAX_MODELS`: Maximum number of models to use for each task
- `SWARM_VOTING_THRESHOLD`: Threshold for consensus in model voting
- `TRADING_ENABLED`: Enable/disable trading functionality
- `MAX_POSITION_SIZE`: Maximum position size for trading
- `RISK_TOLERANCE`: Risk tolerance level (0-1)

## API Documentation

### Model Integration
```typescript
interface ModelResult {
  provider: string;
  result: string;
  confidence: number;
  metadata?: {
    latency: number;
    tokenCount: number;
  };
}
```

### Trading Interface
```typescript
interface TradeSignal {
  symbol: string;
  action: 'buy' | 'sell';
  price: number;
  confidence: number;
  timestamp: Date;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
