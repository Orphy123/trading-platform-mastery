import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

from .feature_engineering import FeatureEngineer
from .prediction_model import TradingModel
from ..news_sentiment.news_sentiment_manager import NewsSentimentManager
from ..market_data.api_client import MarketDataClient


class ModelTrainer:
    """
    Class for training and evaluating trading models
    """
    def __init__(self):
        """
        Initialize the model trainer
        """
        self.feature_engineer = FeatureEngineer()
        
    def load_and_prepare_data(self, price_data, sentiment_data=None, lookahead=5, threshold=0.01):
        """
        Load and prepare data for model training
        
        Args:
            price_data (pandas.DataFrame): OHLCV price data
            sentiment_data (dict): Dictionary with sentiment data by date
            lookahead (int): Periods to look ahead for target
            threshold (float): Price change threshold for signals
            
        Returns:
            tuple: (X, y) feature matrix and target vector
        """
        # Prepare features
        df = self.feature_engineer.prepare_features(
            price_data, 
            sentiment_data, 
            lookahead=lookahead, 
            threshold=threshold
        )
        
        # Separate features and target
        y = df['target']
        
        # Select features to use
        feature_cols = [
            'ma_5', 'ma_20', 'rsi', 'macd', 'macd_signal', 
            'bb_upper', 'bb_lower', 'price_momentum_1d', 'price_momentum_5d', 
            'volatility_5d', 'price_ma_ratio_5', 'price_ma_ratio_20',
            'ma_crossover', 'ma_crossunder', 'hlc_ratio', 'trend_strength'
        ]
        
        # Add sentiment features if available
        sentiment_cols = [
            'sentiment_score', 'sentiment_magnitude', 'positive_ratio',
            'negative_ratio', 'neutral_ratio', 'article_count', 'has_news'
        ]
        
        for col in sentiment_cols:
            if col in df.columns:
                feature_cols.append(col)
        
        X = df[feature_cols]
        
        return X, y
    
    def train_model(self, X, y, model_type='random_forest', optimize=False):
        """
        Train a trading model
        
        Args:
            X (pandas.DataFrame): Feature matrix
            y (pandas.Series): Target vector
            model_type (str): Type of model to train
            optimize (bool): Whether to optimize hyperparameters
            
        Returns:
            TradingModel: Trained model
        """
        # Create model
        model = TradingModel(model_type=model_type)
        
        # Train with hyperparameter optimization if requested
        if optimize:
            model.optimize_hyperparameters(X, y, cv=5)
        else:
            model.fit(X, y)
        
        return model
    
    def evaluate_model(self, model, X_test, y_test):
        """
        Evaluate a trained model
        
        Args:
            model (TradingModel): Trained model to evaluate
            X_test (pandas.DataFrame): Test features
            y_test (pandas.Series): Test targets
            
        Returns:
            dict: Evaluation metrics
        """
        return model.evaluate(X_test, y_test)
    
    def full_training_pipeline(self, price_data, sentiment_data=None, 
                              test_size=0.2, random_state=42,
                              lookahead=5, threshold=0.01, 
                              model_type='random_forest',
                              optimize=False, save_model=True):
        """
        Run the full training pipeline
        
        Args:
            price_data (pandas.DataFrame): OHLCV price data
            sentiment_data (dict): Dictionary of sentiment data by date
            test_size (float): Proportion of data to use for testing
            random_state (int): Random seed for reproducibility
            lookahead (int): Periods to look ahead for target
            threshold (float): Price change threshold for signals
            model_type (str): Type of model to train
            optimize (bool): Whether to optimize hyperparameters
            save_model (bool): Whether to save the trained model
            
        Returns:
            tuple: (model, metrics, X_test, y_test, y_pred) Model and evaluation results
        """
        from sklearn.model_selection import train_test_split
        
        # Prepare data
        X, y = self.load_and_prepare_data(
            price_data, 
            sentiment_data, 
            lookahead=lookahead,
            threshold=threshold
        )
        
        # Split into training and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, shuffle=False
        )
        
        # Train model
        model = self.train_model(X_train, y_train, model_type=model_type, optimize=optimize)
        
        # Evaluate model
        metrics = self.evaluate_model(model, X_test, y_test)
        
        # Get predictions for test set
        y_pred = model.predict(X_test)
        
        # Save model if requested
        if save_model:
            os.makedirs('models', exist_ok=True)
            model.save_model(directory='models')
        
        # Plot feature importances
        importances = model.get_feature_importances()
        if importances:
            plt.figure(figsize=(10, 6))
            plt.bar(range(len(importances)), list(importances.values()), align='center')
            plt.xticks(range(len(importances)), list(importances.keys()), rotation=90)
            plt.title(f'Feature Importances ({model_type})')
            plt.tight_layout()
            plt.savefig(f'models/{model_type}_feature_importances.png')
        
        return model, metrics, X_test, y_test, y_pred
    
    def predict_signals(self, model, price_data, sentiment_data=None):
        """
        Generate trading signals for new data
        
        Args:
            model (TradingModel): Trained model
            price_data (pandas.DataFrame): Latest price data
            sentiment_data (dict): Latest sentiment data
            
        Returns:
            pandas.DataFrame: DataFrame with predicted signals
        """
        # Prepare features
        df = self.feature_engineer.add_technical_indicators(price_data)
        
        # Add sentiment features if available
        if sentiment_data:
            df = self.feature_engineer.merge_sentiment_features(df, sentiment_data)
        
        # Get feature columns that match the model's expected features
        model_features = model.feature_columns
        missing_features = set(model_features) - set(df.columns)
        
        # Handle missing features
        for feature in missing_features:
            df[feature] = 0.0  # Fill with default value
        
        # Select only the features expected by the model
        X = df[model_features]
        
        # Generate predictions
        signals = model.predict(X)
        
        # Add signals to the dataframe
        df['signal'] = signals
        
        # Map signals to labels for clarity
        signal_map = {1: 'BUY', -1: 'SELL', 0: 'HOLD'}
        df['signal_label'] = df['signal'].map(signal_map)
        
        return df