import os
import json
from news_api_client import NewsAPIClient
from sentiment_analyzer import SentimentAnalyzer
from news_sentiment_manager import NewsSentimentManager

# Initialize components
news_client = NewsAPIClient(api_provider='newsapi', api_key='YOUR_API_KEY')
sentiment_analyzer = SentimentAnalyzer()
manager = NewsSentimentManager(news_client, sentiment_analyzer)

# Define assets to analyze
assets = ['US100', 'US30', 'EUR/USD', 'GBP/USD', 'Crude Oil WTI', 'Crude Oil Brent']

# Collect and analyze news
results = manager.collect_and_analyze_news(assets, days_back=3, max_articles_per_asset=5)

# Get sentiment features for ML model
sentiment_features = manager.get_news_sentiment_features(results)

# Print summary for each asset
for asset, articles in results.items():
    summary = manager.calculate_asset_sentiment_summary(articles)
    print(f"\nSentiment Summary for {asset}:")
    print(f"Number of articles: {summary['count']}")
    print(f"Average sentiment score: {summary['avg_vader_compound']:.2f}")
    print(f"Sentiment distribution: {summary['sentiment_distribution']}")
    print(f"Overall sentiment: {summary['overall_sentiment']}")
    print(f"Key phrases: {', '.join(summary['key_phrases'][:3])}")

# Example of how sentiment features can be used in ML prediction
print("\nSentiment Features for ML Model:")
for asset, features in sentiment_features.items():
    print(f"\n{asset}:")
    for feature, value in features.items():
        print(f"  {feature}: {value}")
