# News Sentiment Analysis Module

This module handles the collection and analysis of financial news sentiment for trading assets.

## Components

- `NewsAPIClient`: Fetches news articles from various news API providers
- `SentimentAnalyzer`: Analyzes sentiment using VADER and TextBlob
- `NewsSentimentManager`: Orchestrates collection, analysis, and storage of sentiment data

## Supported Assets

- US100 (NASDAQ 100)
- US30 (Dow Jones Industrial Average)
- EUR/USD (Euro/US Dollar)
- GBP/USD (British Pound/US Dollar)
- Crude Oil WTI
- Crude Oil Brent

## Installation

```bash
pip install textblob vaderSentiment numpy
python -m textblob.download_corpora
```

## Usage

### Basic Usage Example

```python
from news_api_client import NewsAPIClient
from sentiment_analyzer import SentimentAnalyzer
from news_sentiment_manager import NewsSentimentManager

# Initialize components
news_client = NewsAPIClient(api_provider='newsapi', api_key='YOUR_API_KEY')
sentiment_analyzer = SentimentAnalyzer()
manager = NewsSentimentManager(news_client, sentiment_analyzer)

# Define assets to analyze
assets = ['US100', 'US30', 'EUR/USD', 'GBP/USD', 'Crude Oil WTI']

# Collect and analyze news
results = manager.collect_and_analyze_news(assets, days_back=3, max_articles_per_asset=5)

# Get sentiment features for ML model
sentiment_features = manager.get_news_sentiment_features(results)
```

## Sentiment Features for ML Integration

The `get_news_sentiment_features()` method provides the following features for each asset:

- `sentiment_score`: Overall sentiment score (-1 to +1)
- `sentiment_magnitude`: Intensity/strength of sentiment
- `textblob_score`: Alternative sentiment score from TextBlob
- `positive_ratio`: Ratio of positive news articles
- `negative_ratio`: Ratio of negative news articles
- `neutral_ratio`: Ratio of neutral news articles
- `article_count`: Number of articles analyzed
- `sentiment_label`: Overall sentiment label (positive, neutral, negative)
- `has_news`: Boolean indicator of news availability

## Sample Output

```json
{
  "EUR/USD": {
    "sentiment_score": 0.32,
    "sentiment_magnitude": 0.32,
    "textblob_score": 0.28,
    "positive_ratio": 0.6,
    "negative_ratio": 0.2,
    "neutral_ratio": 0.2,
    "article_count": 5,
    "sentiment_label": "positive",
    "has_news": true
  }
}
```

## API Requirements

### NewsAPI
- Register for an API key at https://newsapi.org/
- Free tier: 100 requests per day
- Paid tiers available for production use

### Finnhub
- Register for an API key at https://finnhub.io/
- Free tier: 60 API calls/minute
- Paid tiers available for higher rate limits

## Notes

- The sentiment analysis uses a combination of VADER and TextBlob for more robust results
- Key phrases are extracted automatically to identify important topics
- News is deduplicated to avoid redundancy
