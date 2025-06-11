// src/services/signalService.js
import { API_BASE_URL, fetchWithErrorHandling, USE_MOCK_DATA, SAMPLE_DATA } from './apiConfig';

/**
 * Get the latest trading signal for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @returns {Promise<Object>} Trading signal data
 */
export async function getLatestSignal(symbol) {
  if (USE_MOCK_DATA) {
    const asset = SAMPLE_DATA.TRADING_SIGNALS.assets.find(a => a.symbol === symbol);
    
    if (asset) {
      return asset.current_signal;
    }
    
    // If asset not found in signals data, generate mock data
    const signal = Math.random() > 0.6 ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'HOLD';
    const strength = 0.3 + Math.random() * 0.6; // Random strength between 0.3 and 0.9
    
    return {
      signal,
      signal_strength: strength,
      generated_at: new Date().toISOString(),
      key_indicators: {
        trend: signal === 'BUY' ? 'bullish' : signal === 'SELL' ? 'bearish' : 'neutral',
        rsi: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
        macd: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
        moving_averages: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral'
      }
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/signals/${encodeURIComponent(symbol)}`);
}

/**
 * Get historical trading signals for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @param {string} timeframe - Timeframe ('1d', '1w', '1m')
 * @param {number} limit - Number of signals to return
 * @returns {Promise<Object>} Historical trading signals
 */
export async function getHistoricalSignals(symbol, timeframe = '1w', limit = 10) {
  if (USE_MOCK_DATA) {
    const now = new Date();
    const signals = ['BUY', 'HOLD', 'SELL'];
    const data = [];
    
    // Determine time interval in milliseconds based on timeframe
    let interval;
    switch (timeframe) {
      case '1d': interval = 24 * 60 * 60 * 1000; break;
      case '1m': interval = 30 * 24 * 60 * 60 * 1000; break;
      default: interval = 7 * 24 * 60 * 60 * 1000; // Default to 1w
    }
    
    // Generate historical signal data
    for (let i = 0; i < limit; i++) {
      const time = new Date(now.getTime() - (i * interval));
      const randomIndex = Math.floor(Math.random() * signals.length);
      const signal = signals[randomIndex];
      const strength = 0.4 + Math.random() * 0.5;
      
      data.unshift({
        timestamp: Math.floor(time.getTime() / 1000),
        datetime: time.toISOString(),
        signal,
        signal_strength: strength,
        price: 1000 + Math.random() * 1000, // Mock price value
        key_indicators: {
          trend: signal === 'BUY' ? 'bullish' : signal === 'SELL' ? 'bearish' : 'neutral',
          rsi: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
          macd: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
          moving_averages: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral'
        }
      });
    }
    
    return {
      symbol,
      timeframe,
      data,
      updated_at: now.toISOString()
    };
  }
  
  return fetchWithErrorHandling(
    `${API_BASE_URL}/signals/history/${encodeURIComponent(symbol)}?timeframe=${timeframe}&limit=${limit}`
  );
}

/**
 * Get signals for multiple assets
 * @param {string[]} symbols - Array of asset symbols
 * @returns {Promise<Array>} Signals for requested assets
 */
export async function getMultiAssetSignals(symbols) {
  if (USE_MOCK_DATA) {
    return symbols.map(symbol => {
      const asset = SAMPLE_DATA.TRADING_SIGNALS.assets.find(a => a.symbol === symbol);
      
      if (asset) {
        return {
          symbol,
          ...asset.current_signal
        };
      }
      
      // Generate random signal for missing assets
      const signal = Math.random() > 0.6 ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'HOLD';
      const strength = 0.3 + Math.random() * 0.6;
      
      return {
        symbol,
        signal,
        signal_strength: strength,
        generated_at: new Date().toISOString(),
        key_indicators: {
          trend: signal === 'BUY' ? 'bullish' : signal === 'SELL' ? 'bearish' : 'neutral',
          rsi: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
          macd: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral',
          moving_averages: signal === 'BUY' ? 'buy' : signal === 'SELL' ? 'sell' : 'neutral'
        }
      };
    });
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/signals/multi`, {
    method: 'POST',
    body: JSON.stringify({ symbols })
  });
}

/**
 * Get color class for a signal
 * @param {string} signal - Signal type (BUY, HOLD, SELL)
 * @returns {string} Color class name
 */
export function getSignalColor(signal) {
  const upperSignal = signal.toUpperCase();
  
  switch (upperSignal) {
    case 'BUY':
      return 'green';
    case 'SELL':
      return 'red';
    case 'HOLD':
    default:
      return 'yellow';
  }
}

/**
 * Format signal strength for display
 * @param {number} strength - Signal strength (0-1)
 * @returns {string} Formatted strength string
 */
export function formatSignalStrength(strength) {
  if (strength >= 0.8) return 'Very Strong';
  if (strength >= 0.6) return 'Strong';
  if (strength >= 0.4) return 'Moderate';
  if (strength >= 0.2) return 'Weak';
  return 'Very Weak';
}