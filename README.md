# Trading Platform Mastery

A comprehensive trading platform that combines real-time market data, technical analysis, and news sentiment analysis to help traders make informed decisions. This platform provides a modern, intuitive interface for both novice and experienced traders to analyze markets, track trends, and make data-driven trading decisions.

## 🌟 Features

### Trading Dashboard
- Real-time candlestick charts with customizable timeframes
  - Interactive zoom and pan controls
  - Multiple chart types (candlestick, line, area)
  - Customizable chart colors and themes
- Technical analysis indicators
  - Relative Strength Index (RSI) for overbought/oversold conditions
  - Moving Average Convergence Divergence (MACD) for trend following
  - Simple and Exponential Moving Averages (SMA/EMA)
  - Bollinger Bands for volatility analysis
- Machine learning-powered price predictions
  - Short-term price movement forecasts
  - Trend direction probability
  - Support and resistance level identification
- Real-time market data updates
  - Live price feeds
  - Volume analysis
  - Price alerts and notifications

### News Sentiment Analysis
- Real-time news aggregation from multiple sources
  - Financial news websites
  - Economic calendars
  - Social media sentiment
- Advanced sentiment analysis
  - VADER sentiment scoring for market impact
  - TextBlob for detailed sentiment breakdown
  - Key phrase extraction for trend identification
- Sentiment visualization
  - Sentiment score charts
  - News impact timeline
  - Correlation with price movements
- Customizable news filters
  - Asset-specific news
  - Time-based filtering
  - Source credibility weighting

### Market Data Integration
- Support for multiple data providers:
  - TwelveData for forex and crypto
  - Finnhub for stocks and indices
  - Alpha Vantage for comprehensive market data
- Real-time and historical data
  - Intraday data (1m to 1d intervals)
  - Historical data (up to 5 years)
  - Custom date range selection
- Advanced data features
  - Rate limiting and data normalization
  - Data caching for performance
  - Automatic data updates
- Supported markets:
  - Forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
  - Stock indices (US100, US30, etc.)
  - Cryptocurrencies (BTC/USD, ETH/USD, etc.)
  - Commodities (Gold, Oil, etc.)

### User Interface
- Modern, responsive design
  - Dark/light theme support
  - Mobile-friendly layout
  - Customizable dashboard
- Interactive components
  - Draggable panels
  - Resizable charts
  - Collapsible sections
- Performance optimization
  - Lazy loading of components
  - Efficient data caching
  - Smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Frontend Setup
```bash
# Navigate to the frontend directory
cd react_template

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Data Processing Setup
```bash
# Navigate to the data processing directory
cd data_processing

# Install Python dependencies
pip install -r requirements.txt

# Download required NLTK data
python -m textblob.download_corpora
```

## 🏗️ Project Structure

```
trading-platform-mastery/
├── react_template/           # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/     # Layout components
│   │   │   └── trading/    # Trading-specific components
│   │   ├── mockServer.js    # Mock API server
│   │   └── App.jsx         # Main application component
│   └── package.json
│
└── data_processing/         # Python backend
    ├── market_data/        # Market data processing
    ├── news_sentiment/     # News analysis
    └── requirements.txt    # Python dependencies
```

## 💻 Technology Stack

### Frontend
- React 18 for UI components
- Material-UI (MUI) for design system
- Lightweight Charts for trading charts
- Vite for build tooling
- Redux for state management
- Axios for API requests

### Backend
- Python 3.8+ for data processing
- Pandas for data manipulation
- NLTK for natural language processing
- TextBlob for sentiment analysis
- VADER for sentiment scoring
- FastAPI for API endpoints

## 🔧 Configuration

### API Keys
Create a `.env` file in the root directory with your API keys:
```env
TWELVEDATA_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
```

### Supported Assets
- Currency Pairs: EUR/USD, GBP/USD, USD/JPY, etc.
- Indices: US100, US30, S&P 500, etc.
- Cryptocurrencies: BTC/USD, ETH/USD, etc.
- Commodities: Gold, Silver, Crude Oil, etc.

## 📊 Technical Analysis Features

### Indicators
- Relative Strength Index (RSI)
  - Overbought/oversold levels
  - Divergence detection
  - Custom period settings
- Moving Average Convergence Divergence (MACD)
  - Signal line crossovers
  - Histogram analysis
  - Custom parameters
- Moving Averages
  - Simple Moving Averages (SMA)
  - Exponential Moving Averages (EMA)
  - Multiple timeframe analysis
- Bollinger Bands
  - Volatility measurement
  - Price channel analysis
  - Custom standard deviations

### Timeframes
- 1 minute (1m)
- 5 minutes (5m)
- 15 minutes (15m)
- 1 hour (1h)
- 4 hours (4h)
- 1 day (1d)
- Custom timeframes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lightweight Charts](https://github.com/tradingview/lightweight-charts)
- [Material-UI](https://mui.com/)
- [VADER Sentiment Analysis](https://github.com/cjhutto/vaderSentiment)
- [TextBlob](https://textblob.readthedocs.io/) 