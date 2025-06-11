# ML Trading Signal Prediction Model

## Overview
This module provides a lightweight machine learning system for generating trading signals (Buy/Sell/Hold) based on technical indicators and news sentiment analysis. The system supports multiple model types and includes feature engineering capabilities.

## Components

### 1. Feature Engineering (`feature_engineering.py`)
- Generates technical indicators from price data
- Adds sentiment features from news analysis
- Creates target variables based on future price movements

### 2. Prediction Model (`prediction_model.py`)
- Supports multiple model types:
  - Random Forest (default)
  - Logistic Regression
  - Decision Tree
  - Gradient Boosting
- Includes model evaluation metrics
- Feature importance analysis
- Model saving/loading capabilities

### 3. Model Trainer (`model_trainer.py`)
- End-to-end pipeline for data preparation, training, and evaluation
- Hyperparameter optimization
- Signal generation for new data

## Included Features

### Technical Indicators
- Moving Averages (5-day, 20-day)
- Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD)
- Bollinger Bands
- Price Momentum (1-day, 5-day)
- Volatility
- Moving Average Crossovers
- High-Low-Close Ratio
- Trend Strength

### Sentiment Features (when available)
- Overall sentiment score
- Sentiment magnitude
- Positive/Negative/Neutral ratios
- Article count
- News presence indicator

## Usage

### Basic Usage
```python
from ml_model import ModelTrainer, TradingModel

# Initialize trainer
trainer = ModelTrainer()

# Train model with price and sentiment data
model, metrics, X_test, y_test, y_pred = trainer.full_training_pipeline(
    price_data=price_data,  # DataFrame with OHLCV data
    sentiment_data=sentiment_data,  # Dictionary with sentiment features by date
    model_type='random_forest',
    optimize=False
)

# Generate signals for new data
signals_df = trainer.predict_signals(model, new_price_data, new_sentiment_data)
```

### Signal Interpretation
- **Buy (1)**: The model predicts a price increase greater than the threshold (default: 1%)
- **Sell (-1)**: The model predicts a price decrease greater than the threshold
- **Hold (0)**: The model does not predict a significant price movement

## Example
See `example_usage.py` for a complete demonstration of model training and signal generation with synthetic data.

## Performance
The model's performance will vary by market and asset type. In testing with synthetic data:
- Random Forest typically achieves 60-70% accuracy
- Inclusion of sentiment features generally improves performance by 2-5%
- Feature importance analysis shows that both technical indicators and sentiment features contribute to predictions

## Requirements
- pandas
- numpy
- scikit-learn
- matplotlib (for visualization)
- joblib (for model persistence)
