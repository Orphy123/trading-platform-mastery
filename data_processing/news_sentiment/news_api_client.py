import requests
import os
from datetime import datetime, timedelta

class NewsAPIClient:
    """
    A client for fetching financial news from various news APIs
    """
    def __init__(self, api_provider='newsapi', api_key=None):
        """
        Initialize the news API client
        
        Args:
            api_provider (str): The news API provider ('newsapi', 'finnhub')
            api_key (str): API key for the provider
        """
        self.api_provider = api_provider.lower()
        self.api_key = api_key
        
        # Base URLs for news APIs
        self.base_urls = {
            'newsapi': 'https://newsapi.org/v2',
            'finnhub': 'https://finnhub.io/api/v1'
        }
        
        # Keywords mapping for each asset to use in news search
        self.asset_keywords = {
            'US100': ['NASDAQ', 'NASDAQ 100', 'NDX', 'tech stocks', 'technology sector'],
            'US30': ['Dow Jones', 'Dow 30', 'DJIA', 'Dow Jones Industrial Average'],
            'EUR/USD': ['EUR/USD', 'euro dollar', 'euro forex', 'euro currency', 'ECB', 'Federal Reserve'],
            'GBP/USD': ['GBP/USD', 'pound dollar', 'sterling', 'Bank of England', 'Brexit'],
            'Crude Oil WTI': ['crude oil', 'WTI', 'oil prices', 'OPEC', 'oil market'],
            'Crude Oil Brent': ['Brent crude', 'Brent oil', 'oil prices', 'OPEC', 'oil market']
        }

    def get_news_for_asset(self, asset, days_back=3, max_articles=10):
        """
        Fetch news articles related to a specific asset
        
        Args:
            asset (str): The asset name from our standard list
            days_back (int): Number of days to look back for news
            max_articles (int): Maximum number of articles to fetch
            
        Returns:
            list: List of news articles
        """
        if self.api_provider not in self.base_urls:
            raise ValueError(f"Unsupported API provider: {self.api_provider}")
            
        keywords = self.asset_keywords.get(asset)
        if not keywords:
            raise ValueError(f"No keywords defined for asset: {asset}")
            
        from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        articles = []
        
        if self.api_provider == 'newsapi':
            # For each keyword, get articles and merge them
            for keyword in keywords:
                url = f"{self.base_urls['newsapi']}/everything"
                params = {
                    'q': keyword,
                    'from': from_date,
                    'sortBy': 'publishedAt',
                    'language': 'en',
                    'apiKey': self.api_key
                }
                
                try:
                    response = requests.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('status') == 'ok':
                            articles.extend(data.get('articles', []))
                    else:
                        print(f"Error fetching news from NewsAPI: {response.status_code}")
                except Exception as e:
                    print(f"Exception when fetching news: {e}")
                    
        elif self.api_provider == 'finnhub':
            # Use Finnhub's news endpoint
            for keyword in keywords:
                url = f"{self.base_urls['finnhub']}/news"
                params = {
                    'category': 'general',
                    'token': self.api_key
                }
                
                try:
                    response = requests.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        # Filter articles containing our keyword
                        for article in data:
                            if keyword.lower() in article.get('headline', '').lower() or \
                               keyword.lower() in article.get('summary', '').lower():
                                articles.append({
                                    'title': article.get('headline'),
                                    'description': article.get('summary'),
                                    'url': article.get('url'),
                                    'publishedAt': article.get('datetime'),
                                    'source': {'name': article.get('source')}
                                })
                except Exception as e:
                    print(f"Exception when fetching news: {e}")
        
        # Deduplicate articles based on title
        unique_articles = []
        titles = set()
        for article in articles:
            if article['title'] not in titles:
                titles.add(article['title'])
                unique_articles.append(article)
                
                # Add the asset reference
                article['asset'] = asset
        
        # Sort by publication date and return the most recent ones
        sorted_articles = sorted(unique_articles, 
                                 key=lambda x: x.get('publishedAt', ''),
                                 reverse=True)
        
        return sorted_articles[:max_articles]
