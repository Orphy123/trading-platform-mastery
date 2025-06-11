import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime, timedelta

# Import our modules
from feature_engineering import FeatureEngineer
from prediction_model import TradingModel
from model_trainer import ModelTrainer

# Example for using the ML prediction model
def generate_example_data(n_samples=500):
    """
    Generate synthetic market data for example purposes
    
    Returns:
        pandas.DataFrame: OHLCV data with dates
    """
    # Create date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=n_samples)
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Set seed for reproducibility
    np.random.seed(42)
    
    # Generate random walk for close prices
    close = 100 + np.cumsum(np.random.normal(0, 1, len(date_range)))
    
    # Generate other OHLCV data
    daily_volatility = 0.5
    high = close + abs(np.random.normal(0, daily_volatility, len(date_range)))
    low = close - abs(np.random.normal(0, daily_volatility, len(date_range)))
    open_price = close.shift(1).fillna(close[0] - np.random.normal(0, daily_volatility))
    volume = np.random.randint(1000, 10000, len(date_range))
    
    # Create DataFrame
    df = pd.DataFrame({
        'open': open_price,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume
    }, index=date_range)
    
    return df

def generate_example_sentiment(price_df):
    """
    Generate synthetic sentiment data for example purposes
    
    Args:
        price_df (pandas.DataFrame): Price dataframe with dates as index
        
    Returns:
        dict: Sentiment data by date
    """
    # Create synthetic sentiment data
    sentiment_data = {}
    
    # Get dates from price data and use 30% of them for sentiment data
    dates = price_df.index
    np.random.seed(42)
    sentiment_dates = np.random.choice(
        dates, size=int(len(dates) * 0.3), replace=False
    )
    
    # Generate sentiment features for selected dates
    for date in sentiment_dates:
        # Calculate price change to correlate with sentiment
        price_idx = dates.get_loc(date)
        if price_idx > 0:
            price_change = (price_df.iloc[price_idx]['close'] - 
                          price_df.iloc[price_idx-1]['close']) / 
                          price_df.iloc[price_idx-1]['close']
        else:
            price_change = 0
        
        # Base sentiment on price change with some noise
        base_sentiment = np.clip(price_change * 20, -1, 1)  # Scale and clip
        sentiment_score = base_sentiment + np.random.normal(0, 0.2)  # Add noise
        
        # Calculate other sentiment metrics
        if sentiment_score > 0.2:
            pos_ratio = 0.6 + np.random.random() * 0.3  # 0.6-0.9
            neg_ratio = 1 - pos_ratio - 0.1  # Reserve 0.1 for neutral
            neutral_ratio = 0.1
        elif sentiment_score < -0.2:
            neg_ratio = 0.6 + np.random.random() * 0.3  # 0.6-0.9
            pos_ratio = 1 - neg_ratio - 0.1  # Reserve 0.1 for neutral
            neutral_ratio = 0.1
        else:
            # More neutral sentiment
            neutral_ratio = 0.5 + np.random.random() * 0.2  # 0.5-0.7
            remainder = 1 - neutral_ratio
            pos_ratio = remainder * 0.5 + np.random.random() * remainder * 0.5
            neg_ratio = 1 - neutral_ratio - pos_ratio
        
        # Generate random article count between 1-10
        article_count = np.random.randint(1, 11)
        
        # Store in dictionary
        sentiment_data[date] = {
            'sentiment_score': sentiment_score,
            'sentiment_magnitude': abs(sentiment_score) + np.random.random() * 0.5,
            'positive_ratio': pos_ratio,
            'negative_ratio': neg_ratio,
            'neutral_ratio': neutral_ratio,
            'article_count': article_count,
            'has_news': True
        }
    
    return sentiment_data

def run_example():
    """
    Run an example of the full ML prediction pipeline
    """
    print("\n===== Running ML Prediction Model Example =====\n")
    
    # Generate example data
    print("Generating synthetic market data...")
    price_data = generate_example_data(n_samples=500)
    print(f"Generated {len(price_data)} days of OHLCV data")
    
    # Generate example sentiment
    print("\nGenerating synthetic sentiment data...")
    sentiment_data = generate_example_sentiment(price_data)
    print(f"Generated sentiment data for {len(sentiment_data)} days")
    
    # Initialize model trainer
    trainer = ModelTrainer()
    
    # Run full training pipeline
    print("\nTraining model with price and sentiment data...")
    model, metrics, X_test, y_test, y_pred = trainer.full_training_pipeline(
        price_data=price_data,
        sentiment_data=sentiment_data,
        model_type='random_forest',
        optimize=False,
        lookahead=5,
        threshold=0.01
    )
    
    # Show accuracy
    print(f"\nModel accuracy: {metrics['accuracy']:.4f}")
    
    # Show feature importance
    importances = model.get_feature_importances()
    if importances:
        print("\nTop 10 most important features:")
        for i, (feature, importance) in enumerate(list(importances.items())[:10]):
            print(f"{i+1}. {feature}: {importance:.4f}")
    
    # Generate signals for the most recent data
    print("\nGenerating signals for recent data...")
    recent_data = price_data.iloc[-30:]  # Last 30 days
    
    # Create a dictionary with recent sentiment if available
    recent_sentiment = {}
    for date in recent_data.index:
        if date in sentiment_data:
            recent_sentiment[date] = sentiment_data[date]
    
    # Predict signals
    signals_df = trainer.predict_signals(model, recent_data, recent_sentiment)
    
    # Count signals
    signal_counts = signals_df['signal_label'].value_counts()
    print("\nSignal distribution in recent data:")
    for signal, count in signal_counts.items():
        print(f"{signal}: {count}")
    
    # Print the last 5 days of signals
    print("\nMost recent signals:")
    latest_signals = signals_df.iloc[-5:][['close', 'signal_label']]
    print(latest_signals)
    
    # Plot the price with signals
    plt.figure(figsize=(12, 6))
    plt.plot(signals_df.index, signals_df['close'], label='Close Price')
    
    # Plot buy signals
    buys = signals_df[signals_df['signal'] == 1]
    sells = signals_df[signals_df['signal'] == -1]
    holds = signals_df[signals_df['signal'] == 0]
    
    plt.scatter(buys.index, buys['close'], color='green', label='Buy', marker='^', s=100)
    plt.scatter(sells.index, sells['close'], color='red', label='Sell', marker='v', s=100)
    plt.scatter(holds.index, holds['close'], color='gray', label='Hold', marker='o', s=50, alpha=0.5)
    
    plt.title('Trading Signals on Price Chart')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    
    # Create directory for plots if it doesn't exist
    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/trading_signals.png')
    
    print("\nPlot saved to 'plots/trading_signals.png'")
    
    print("\n===== Example Complete =====\n")
    
    return model, signals_df

if __name__ == "__main__":
    run_example()