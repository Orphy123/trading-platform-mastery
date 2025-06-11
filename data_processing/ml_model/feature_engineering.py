import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

class FeatureEngineer:
    """
    Creates features for the ML prediction model based on market data and sentiment analysis
    """
    def __init__(self):
        """Initialize the feature engineer"""
        pass
        
    def add_technical_indicators(self, df):
        """
        Calculate technical indicators from price data
        
        Args:
            df (pandas.DataFrame): DataFrame with OHLCV data (Open, High, Low, Close, Volume)
            
        Returns:
            pandas.DataFrame: DataFrame with technical indicators added
        """
        # Make a copy to avoid modifying the original dataframe
        df = df.copy()
        
        # 1. Moving Averages
        df['ma_5'] = df['close'].rolling(window=5).mean()
        df['ma_20'] = df['close'].rolling(window=20).mean()
        
        # 2. Relative Strength Index (RSI)
        delta = df['close'].diff()
        gain = delta.where(delta > 0, 0).rolling(window=14).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # 3. MACD (Moving Average Convergence Divergence)
        ema_12 = df['close'].ewm(span=12, adjust=False).mean()
        ema_26 = df['close'].ewm(span=26, adjust=False).mean()
        df['macd'] = ema_12 - ema_26
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        
        # 4. Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + 2 * df['bb_std']
        df['bb_lower'] = df['bb_middle'] - 2 * df['bb_std']
        
        # 5. Price momentum
        df['price_momentum_1d'] = df['close'].pct_change(periods=1)
        df['price_momentum_5d'] = df['close'].pct_change(periods=5)
        
        # 6. Volatility
        df['volatility_5d'] = df['close'].rolling(window=5).std() / df['close'].rolling(window=5).mean()
        
        # 7. Price distance from moving average (normalized)
        df['price_ma_ratio_5'] = df['close'] / df['ma_5']
        df['price_ma_ratio_20'] = df['close'] / df['ma_20']
        
        # 8. Moving average crossovers (binary signals)
        df['ma_crossover'] = ((df['ma_5'] > df['ma_20']) & 
                              (df['ma_5'].shift(1) <= df['ma_20'].shift(1))).astype(int)
        df['ma_crossunder'] = ((df['ma_5'] < df['ma_20']) & 
                               (df['ma_5'].shift(1) >= df['ma_20'].shift(1))).astype(int)
        
        # 9. High-Low range relative to close price
        df['hlc_ratio'] = (df['high'] - df['low']) / df['close']
        
        # 10. Trend strength indicator
        df['trend_strength'] = abs(df['ma_5'] - df['ma_20']) / df['ma_20']
        
        # Drop NaN values that come from the calculations
        # df.dropna(inplace=True)
        
        return df
    
    def add_target_variable(self, df, lookahead=5, threshold=0.01):
        """
        Add target variable (Buy/Sell/Hold signal) based on future price movement
        
        Args:
            df (pandas.DataFrame): DataFrame with price data
            lookahead (int): Number of periods to look ahead for price movement
            threshold (float): Price change threshold for Buy/Sell signal
            
        Returns:
            pandas.DataFrame: DataFrame with target variable added
        """
        df = df.copy()
        
        # Calculate future price changes
        df['future_return'] = df['close'].shift(-lookahead) / df['close'] - 1
        
        # Create target based on threshold
        df['target'] = 0  # 0 = Hold
        df.loc[df['future_return'] > threshold, 'target'] = 1  # 1 = Buy
        df.loc[df['future_return'] < -threshold, 'target'] = -1  # -1 = Sell
        
        # Drop the last few rows where we don't have future data
        df = df.iloc[:-lookahead]
        
        return df
    
    def merge_sentiment_features(self, price_df, sentiment_features):
        """
        Merge sentiment features with price data
        
        Args:
            price_df (pandas.DataFrame): DataFrame with price data and technical indicators
            sentiment_features (dict): Dictionary with sentiment features for each date
            
        Returns:
            pandas.DataFrame: Combined DataFrame with price and sentiment features
        """
        # Create a copy of the dataframe
        df = price_df.copy()
        
        # Initialize sentiment columns with default values
        df['sentiment_score'] = 0.0
        df['sentiment_magnitude'] = 0.0
        df['positive_ratio'] = 0.0
        df['negative_ratio'] = 0.0
        df['neutral_ratio'] = 0.0
        df['article_count'] = 0
        df['has_news'] = False
        
        # Map sentiment values to corresponding dates
        for date, features in sentiment_features.items():
            if date in df.index:
                df.loc[date, 'sentiment_score'] = features.get('sentiment_score', 0.0)
                df.loc[date, 'sentiment_magnitude'] = features.get('sentiment_magnitude', 0.0)
                df.loc[date, 'positive_ratio'] = features.get('positive_ratio', 0.0)
                df.loc[date, 'negative_ratio'] = features.get('negative_ratio', 0.0)
                df.loc[date, 'neutral_ratio'] = features.get('neutral_ratio', 0.0)
                df.loc[date, 'article_count'] = features.get('article_count', 0)
                df.loc[date, 'has_news'] = features.get('has_news', False)
        
        # Forward fill sentiment data (use most recent sentiment until new data arrives)
        sentiment_cols = ['sentiment_score', 'sentiment_magnitude', 'positive_ratio', 
                          'negative_ratio', 'neutral_ratio', 'article_count', 'has_news']
        df[sentiment_cols] = df[sentiment_cols].fillna(method='ffill')
        
        return df
    
    def prepare_features(self, price_df, sentiment_features=None, lookahead=5, threshold=0.01):
        """
        Prepare all features for ML model
        
        Args:
            price_df (pandas.DataFrame): DataFrame with OHLCV data
            sentiment_features (dict): Dictionary with sentiment features
            lookahead (int): Periods to look ahead for target
            threshold (float): Price change threshold for signals
            
        Returns:
            pandas.DataFrame: Prepared features DataFrame
        """
        # Add technical indicators
        df = self.add_technical_indicators(price_df)
        
        # Add sentiment features if available
        if sentiment_features:
            df = self.merge_sentiment_features(df, sentiment_features)
        
        # Add target variable
        df = self.add_target_variable(df, lookahead=lookahead, threshold=threshold)
        
        # Drop rows with NaN values
        df = df.dropna()
        
        return df
