# Trading Assistant Platform - Data Processing

## Overview
This project provides the data processing backend for a trading assistant platform. It includes components for market data retrieval, news sentiment analysis, and ML prediction models.

## Components

### 1. Market Data Client
Access real-time and historical market data from financial APIs:
- Located in `market_data/api_client.py`
- Supports TwelveData, Finnhub, and Alpha Vantage APIs
- Handles rate limiting and data normalization

### 2. News Sentiment Analysis
Analyzes news sentiment for trading decisions:
- Located in `news_sentiment/` directory
- Uses both VADER and TextBlob for sentiment analysis
- Extracts key phrases and provides ML-ready features
- Supports assets: US100, US30, EUR/USD, GBP/USD, Crude Oil WTI/Brent

## Installation

```bash
pip install -r requirements.txt
python -m textblob.download_corpora
```

## Usage

### Market Data Client
```python
from market_data.api_client import MarketDataClient

client = MarketDataClient(provider='twelvedata', api_key='YOUR_API_KEY')
data = client.get_price_data('EUR/USD', interval='1h', bars=100)
```

### News Sentiment Analysis
```python
from news_sentiment import NewsAPIClient, SentimentAnalyzer, NewsSentimentManager

news_client = NewsAPIClient(api_provider='newsapi', api_key='YOUR_API_KEY')
sentiment_analyzer = SentimentAnalyzer()
manager = NewsSentimentManager(news_client, sentiment_analyzer)

assets = ['US100', 'US30', 'EUR/USD']
results = manager.collect_and_analyze_news(assets, days_back=3, max_articles_per_asset=5)
```

## API Documentation

See `docs/api_comparison.md` for a detailed comparison of the supported APIs, including features, rate limits, and pricing.