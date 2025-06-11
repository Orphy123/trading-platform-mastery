from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
from datetime import datetime
import threading
import time
from market_data.api_client import MarketDataClient
from news_sentiment import NewsAPIClient, SentimentAnalyzer, NewsSentimentManager
from ml_models.trading_model import TradingSignalModel

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize clients
market_client = MarketDataClient(provider='twelvedata', api_key='YOUR_API_KEY')
news_client = NewsAPIClient(api_provider='newsapi', api_key='YOUR_API_KEY')
sentiment_analyzer = SentimentAnalyzer()
news_manager = NewsSentimentManager(news_client, sentiment_analyzer)
trading_model = TradingSignalModel()

# Store active subscriptions
active_subscriptions = {}

@app.route('/api/market-data/<asset>')
def get_market_data(asset):
    timeframe = request.args.get('timeframe', '1h')
    try:
        data = market_client.get_price_data(asset, interval=timeframe, bars=100)
        return jsonify({
            'prices': data.to_dict('records'),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trading-signal/<asset>')
def get_trading_signal(asset):
    timeframe = request.args.get('timeframe', '1h')
    try:
        # Get market data
        market_data = market_client.get_price_data(asset, interval=timeframe, bars=100)
        
        # Get news sentiment
        news_data = news_manager.collect_and_analyze_news([asset], days_back=3, max_articles_per_asset=5)
        
        # Generate trading signal
        signal = trading_model.predict(market_data, news_data)
        
        return jsonify({
            'signal': signal['signal'],
            'confidence': signal['confidence'],
            'features': signal['features'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news-sentiment/<asset>')
def get_news_sentiment(asset):
    try:
        news_data = news_manager.collect_and_analyze_news([asset], days_back=3, max_articles_per_asset=5)
        
        # Calculate overall sentiment
        overall_sentiment = {
            'score': sum(article['sentiment'] for article in news_data) / len(news_data),
            'direction': 'positive' if sum(article['sentiment'] for article in news_data) > 0 else 'negative'
        }
        
        return jsonify({
            'overall_sentiment': overall_sentiment,
            'articles': news_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def background_market_data_updates():
    while True:
        for asset, timeframe in active_subscriptions.get('market_data', []):
            try:
                data = market_client.get_price_data(asset, interval=timeframe, bars=1)
                socketio.emit('market_data_update', {
                    'asset': asset,
                    'timeframe': timeframe,
                    'data': data.iloc[-1].to_dict(),
                    'timestamp': datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error updating market data for {asset}: {str(e)}")
        time.sleep(1)  # Update every second

def background_signal_updates():
    while True:
        for asset, timeframe in active_subscriptions.get('trading_signals', []):
            try:
                market_data = market_client.get_price_data(asset, interval=timeframe, bars=100)
                news_data = news_manager.collect_and_analyze_news([asset], days_back=3, max_articles_per_asset=5)
                signal = trading_model.predict(market_data, news_data)
                
                socketio.emit('trading_signal_update', {
                    'asset': asset,
                    'timeframe': timeframe,
                    'signal': signal,
                    'timestamp': datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error updating trading signal for {asset}: {str(e)}")
        time.sleep(5)  # Update every 5 seconds

@socketio.on('subscribe')
def handle_subscription(data):
    subscription_type = data.get('type')
    asset = data.get('asset')
    timeframe = data.get('timeframe')
    
    if subscription_type and asset and timeframe:
        if subscription_type not in active_subscriptions:
            active_subscriptions[subscription_type] = []
        
        if (asset, timeframe) not in active_subscriptions[subscription_type]:
            active_subscriptions[subscription_type].append((asset, timeframe))

@socketio.on('unsubscribe')
def handle_unsubscription(data):
    subscription_type = data.get('type')
    asset = data.get('asset')
    timeframe = data.get('timeframe')
    
    if subscription_type in active_subscriptions:
        active_subscriptions[subscription_type] = [
            (a, t) for a, t in active_subscriptions[subscription_type]
            if not (a == asset and t == timeframe)
        ]

if __name__ == '__main__':
    # Start background update threads
    threading.Thread(target=background_market_data_updates, daemon=True).start()
    threading.Thread(target=background_signal_updates, daemon=True).start()
    
    # Start the Flask app
    socketio.run(app, debug=True, port=5000) 