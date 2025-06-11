import pandas as pd
import numpy as np

def calculate_sma(data, period):
    """Calculate Simple Moving Average"""
    return data.rolling(window=period).mean()

def calculate_ema(data, period):
    """Calculate Exponential Moving Average"""
    return data.ewm(span=period, adjust=False).mean()

def calculate_rsi(data, period=14):
    """Calculate Relative Strength Index"""
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(data, fast_period=12, slow_period=26, signal_period=9):
    """Calculate MACD (Moving Average Convergence Divergence)"""
    fast_ema = calculate_ema(data, fast_period)
    slow_ema = calculate_ema(data, slow_period)
    macd_line = fast_ema - slow_ema
    signal_line = calculate_ema(macd_line, signal_period)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def calculate_bollinger_bands(data, period=20, num_std=2):
    """Calculate Bollinger Bands"""
    sma = calculate_sma(data, period)
    std = data.rolling(window=period).std()
    upper_band = sma + (std * num_std)
    lower_band = sma - (std * num_std)
    return upper_band, sma, lower_band

def calculate_stochastic(data, high, low, period=14, smooth_k=3):
    """Calculate Stochastic Oscillator"""
    lowest_low = low.rolling(window=period).min()
    highest_high = high.rolling(window=period).max()
    k = 100 * ((data - lowest_low) / (highest_high - lowest_low))
    d = k.rolling(window=smooth_k).mean()
    return k, d

def calculate_atr(high, low, close, period=14):
    """Calculate Average True Range"""
    tr1 = high - low
    tr2 = abs(high - close.shift())
    tr3 = abs(low - close.shift())
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return tr.rolling(window=period).mean()

def get_all_indicators(df):
    """Calculate all technical indicators for a price dataframe"""
    indicators = {}
    
    # Price data
    close = df['close']
    high = df['high']
    low = df['low']
    
    # Moving Averages
    indicators['sma_20'] = calculate_sma(close, 20)
    indicators['sma_50'] = calculate_sma(close, 50)
    indicators['sma_200'] = calculate_sma(close, 200)
    indicators['ema_20'] = calculate_ema(close, 20)
    
    # RSI
    indicators['rsi'] = calculate_rsi(close)
    
    # MACD
    macd_line, signal_line, histogram = calculate_macd(close)
    indicators['macd'] = macd_line
    indicators['macd_signal'] = signal_line
    indicators['macd_histogram'] = histogram
    
    # Bollinger Bands
    upper, middle, lower = calculate_bollinger_bands(close)
    indicators['bb_upper'] = upper
    indicators['bb_middle'] = middle
    indicators['bb_lower'] = lower
    
    # Stochastic
    k, d = calculate_stochastic(close, high, low)
    indicators['stoch_k'] = k
    indicators['stoch_d'] = d
    
    # ATR
    indicators['atr'] = calculate_atr(high, low, close)
    
    return pd.DataFrame(indicators)

def generate_trading_signals(df):
    """Generate trading signals based on technical indicators"""
    signals = pd.DataFrame(index=df.index)
    
    # RSI signals
    signals['rsi_signal'] = 0
    signals.loc[df['rsi'] < 30, 'rsi_signal'] = 1  # Oversold
    signals.loc[df['rsi'] > 70, 'rsi_signal'] = -1  # Overbought
    
    # MACD signals
    signals['macd_signal'] = 0
    signals.loc[df['macd'] > df['macd_signal'], 'macd_signal'] = 1  # Bullish
    signals.loc[df['macd'] < df['macd_signal'], 'macd_signal'] = -1  # Bearish
    
    # Bollinger Bands signals
    signals['bb_signal'] = 0
    signals.loc[df['close'] < df['bb_lower'], 'bb_signal'] = 1  # Oversold
    signals.loc[df['close'] > df['bb_upper'], 'bb_signal'] = -1  # Overbought
    
    # Stochastic signals
    signals['stoch_signal'] = 0
    signals.loc[(df['stoch_k'] < 20) & (df['stoch_d'] < 20), 'stoch_signal'] = 1  # Oversold
    signals.loc[(df['stoch_k'] > 80) & (df['stoch_d'] > 80), 'stoch_signal'] = -1  # Overbought
    
    # Combined signal
    signals['combined_signal'] = (
        signals['rsi_signal'] +
        signals['macd_signal'] +
        signals['bb_signal'] +
        signals['stoch_signal']
    )
    
    # Final trading signal
    signals['trading_signal'] = 0
    signals.loc[signals['combined_signal'] >= 2, 'trading_signal'] = 1  # Strong buy
    signals.loc[signals['combined_signal'] <= -2, 'trading_signal'] = -1  # Strong sell
    
    return signals 