import os
import json
import numpy as np
from datetime import datetime

class NewsSentimentManager:
    """
    Manages the collection and analysis of news sentiment for trading assets
    """
    def __init__(self, news_api_client, sentiment_analyzer, data_dir=None):
        self.news_api_client = news_api_client
        self.sentiment_analyzer = sentiment_analyzer
        self.data_dir = data_dir if data_dir else os.path.join(os.getcwd(), 'data')
        os.makedirs(self.data_dir, exist_ok=True)
        
    def collect_and_analyze_news(self, assets, days_back=3, max_articles_per_asset=10):
        """
        Collect and analyze news for multiple assets
        
        Args:
            assets (list): List of asset names
            days_back (int): Days to look back for news
            max_articles_per_asset (int): Max articles per asset
            
        Returns:
            dict: Dictionary with asset names as keys and analyzed articles as values
        """
        all_results = {}
        
        for asset in assets:
            print(f"Collecting news for {asset}...")
            
            # Get news articles
            articles = self.news_api_client.get_news_for_asset(
                asset, days_back, max_articles_per_asset
            )
            
            # Analyze sentiment
            analyzed_articles = []
            for article in articles:
                analyzed_article = self.sentiment_analyzer.analyze_article(article)
                analyzed_articles.append(analyzed_article)
            
            all_results[asset] = analyzed_articles
            
            # Save to json file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{asset.replace('/', '_')}_{timestamp}.json"
            with open(os.path.join(self.data_dir, filename), 'w') as f:
                json.dump(analyzed_articles, f, indent=4)
                
        return all_results
    
    def calculate_asset_sentiment_summary(self, asset_articles):
        """
        Calculate summary sentiment metrics for an asset
        
        Args:
            asset_articles (list): List of analyzed articles for an asset
            
        Returns:
            dict: Summary sentiment metrics
        """
        if not asset_articles:
            return {
                'count': 0,
                'avg_vader_compound': 0,
                'avg_textblob_polarity': 0,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'sentiment_distribution': {
                    'positive': 0,
                    'neutral': 0,
                    'negative': 0
                },
                'overall_sentiment': 'neutral',
                'key_phrases': []
            }
            
        # Extract sentiment scores
        vader_scores = [a['sentiment']['vader_compound'] for a in asset_articles]
        textblob_scores = [a['sentiment']['textblob_polarity'] for a in asset_articles]
        
        # Count sentiments
        sentiments = [a['sentiment']['sentiment_label'] for a in asset_articles]
        positive_count = sentiments.count('positive')
        negative_count = sentiments.count('negative')
        neutral_count = sentiments.count('neutral')
        total_count = len(sentiments)
        
        # Calculate distribution percentages
        sentiment_dist = {
            'positive': (positive_count / total_count) * 100 if total_count > 0 else 0,
            'neutral': (neutral_count / total_count) * 100 if total_count > 0 else 0, 
            'negative': (negative_count / total_count) * 100 if total_count > 0 else 0
        }
        
        # Determine overall sentiment
        if positive_count > negative_count and positive_count > neutral_count:
            overall = 'positive'
        elif negative_count > positive_count and negative_count > neutral_count:
            overall = 'negative'
        else:
            overall = 'neutral'
            
        # Extract key phrases across all articles
        all_text = " ".join([
            f"{a.get('title', '')}. {a.get('description', '')}" 
            for a in asset_articles
        ])
        key_phrases = self.sentiment_analyzer.extract_key_phrases(all_text, 10)
        
        return {
            'count': total_count,
            'avg_vader_compound': np.mean(vader_scores) if vader_scores else 0,
            'avg_textblob_polarity': np.mean(textblob_scores) if textblob_scores else 0,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'sentiment_distribution': sentiment_dist,
            'overall_sentiment': overall,
            'key_phrases': key_phrases
        }
    
    def get_news_sentiment_features(self, all_assets_articles):
        """
        Extract sentiment features for ML model
        
        Args:
            all_assets_articles (dict): Dictionary with asset names and analyzed articles
            
        Returns:
            dict: Dictionary with asset names and sentiment features
        """
        features = {}
        
        for asset, articles in all_assets_articles.items():
            # Get summary
            summary = self.calculate_asset_sentiment_summary(articles)
            
            # Extract ML features
            features[asset] = {
                'sentiment_score': summary['avg_vader_compound'],  # Main sentiment score
                'sentiment_magnitude': abs(summary['avg_vader_compound']),  # Intensity of sentiment
                'textblob_score': summary['avg_textblob_polarity'],
                'positive_ratio': summary['sentiment_distribution']['positive'] / 100,
                'negative_ratio': summary['sentiment_distribution']['negative'] / 100,
                'neutral_ratio': summary['sentiment_distribution']['neutral'] / 100,
                'article_count': summary['count'],
                'sentiment_label': summary['overall_sentiment'],
                'has_news': summary['count'] > 0
            }
            
        return features
