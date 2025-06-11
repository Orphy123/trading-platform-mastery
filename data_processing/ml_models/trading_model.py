import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
from ..technical_analysis import get_all_indicators, generate_trading_signals

class TradingSignalModel:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def prepare_features(self, market_data, sentiment_data):
        """Combine market data, technical indicators, and sentiment features"""
        # Calculate technical indicators
        indicators = get_all_indicators(market_data)
        
        # Generate technical signals
        signals = generate_trading_signals(pd.concat([market_data, indicators], axis=1))
        
        # Combine all features
        features = pd.DataFrame()
        
        # Market data features
        features['price_change'] = market_data['close'].pct_change()
        features['volume_change'] = market_data['volume'].pct_change()
        features['high_low_ratio'] = market_data['high'] / market_data['low']
        
        # Technical indicators
        features['rsi'] = indicators['rsi']
        features['macd'] = indicators['macd']
        features['macd_signal'] = indicators['macd_signal']
        features['bb_position'] = (market_data['close'] - indicators['bb_lower']) / (indicators['bb_upper'] - indicators['bb_lower'])
        features['stoch_k'] = indicators['stoch_k']
        features['stoch_d'] = indicators['stoch_d']
        features['atr'] = indicators['atr']
        
        # Technical signals
        features['rsi_signal'] = signals['rsi_signal']
        features['macd_signal'] = signals['macd_signal']
        features['bb_signal'] = signals['bb_signal']
        features['stoch_signal'] = signals['stoch_signal']
        features['combined_signal'] = signals['combined_signal']
        
        # Sentiment features
        features['sentiment_score'] = sentiment_data['compound']
        features['sentiment_volume'] = sentiment_data['article_count']
        
        # Add lagged features
        for lag in [1, 2, 3]:
            features[f'price_change_lag_{lag}'] = features['price_change'].shift(lag)
            features[f'volume_change_lag_{lag}'] = features['volume_change'].shift(lag)
            features[f'rsi_lag_{lag}'] = features['rsi'].shift(lag)
        
        return features.dropna()
    
    def train(self, market_data, sentiment_data, labels):
        """Train the model"""
        features = self.prepare_features(market_data, sentiment_data)
        X = self.scaler.fit_transform(features)
        self.model.fit(X, labels)
    
    def predict(self, market_data, sentiment_data):
        """Generate trading signals with confidence scores"""
        features = self.prepare_features(market_data, sentiment_data)
        X = self.scaler.transform(features)
        
        # Get model predictions
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        
        # Get technical signals
        signals = generate_trading_signals(pd.concat([market_data, get_all_indicators(market_data)], axis=1))
        
        # Combine model prediction with technical signals
        final_signal = predictions[-1]
        model_confidence = max(probabilities[-1])
        
        # Adjust confidence based on technical signals
        technical_confidence = abs(signals['combined_signal'].iloc[-1]) / 4  # Normalize to 0-1
        combined_confidence = (model_confidence + technical_confidence) / 2
        
        return {
            'signal': 'BUY' if final_signal == 1 else 'SELL',
            'confidence': combined_confidence * 100,  # Convert to percentage
            'features': features.iloc[-1].to_dict(),
            'technical_signals': {
                'rsi': signals['rsi_signal'].iloc[-1],
                'macd': signals['macd_signal'].iloc[-1],
                'bollinger_bands': signals['bb_signal'].iloc[-1],
                'stochastic': signals['stoch_signal'].iloc[-1],
                'combined': signals['combined_signal'].iloc[-1]
            }
        }
    
    def save_model(self, path):
        """Save the trained model"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, path)
    
    def load_model(self, path):
        """Load a trained model"""
        saved_model = joblib.load(path)
        self.model = saved_model['model']
        self.scaler = saved_model['scaler'] 