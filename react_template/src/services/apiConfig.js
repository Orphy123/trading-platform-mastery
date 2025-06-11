// src/services/apiConfig.js
/**
 * API configuration for the Trading Assistant Platform
 */

// Base URLs
export const API_BASE_URL = 'http://localhost:3000/api';
export const WS_URL = 'ws://localhost:3000/ws';

// Mock data mode (true for development, false for production)
export const USE_MOCK_DATA = true;

// Development mode flag
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Available assets for trading
export const AVAILABLE_ASSETS = [
  { value: 'US100', label: 'NASDAQ 100' },
  { value: 'US30', label: 'Dow Jones 30' },
  { value: 'SPX500', label: 'S&P 500' },
  { value: 'BTC/USD', label: 'Bitcoin' },
  { value: 'ETH/USD', label: 'Ethereum' },
  { value: 'EUR/USD', label: 'Euro/USD' },
  { value: 'GBP/USD', label: 'British Pound/USD' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'CRUDE OIL', label: 'Crude Oil' },
  { value: 'AAPL', label: 'Apple Inc.' },
  { value: 'MSFT', label: 'Microsoft' },
  { value: 'GOOGL', label: 'Alphabet (Google)' },
  { value: 'AMZN', label: 'Amazon' },
  { value: 'TSLA', label: 'Tesla' },
];

// API Endpoints
export const ENDPOINTS = {
  ASSET_DASHBOARD: '/dashboard/asset',
  MARKET_OVERVIEW: '/dashboard/market',
  HISTORICAL_DATA: '/historical',
  NEWS: '/news',
  SIGNALS: '/signals',
  SENTIMENT: '/sentiment'
};

/**
 * Fetch data with error handling
 * @param {string} url - URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function fetchWithErrorHandling(url, options = {}) {
  if (USE_MOCK_DATA) {
    // Return mock data instead of making API calls
    console.log('Using mock data for:', url);
    return getMockDataForEndpoint(url);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    // Return mock data as fallback
    return getMockDataForEndpoint(url);
  }
}

/**
 * Get mock data for specific endpoint
 * @param {string} url - API endpoint URL
 * @returns {Object} Mock data
 */
function getMockDataForEndpoint(url) {
  if (url.includes(ENDPOINTS.ASSET_DASHBOARD)) {
    return SAMPLE_DATA.MARKET_DATA.assets[0];
  }
  if (url.includes(ENDPOINTS.MARKET_OVERVIEW)) {
    return SAMPLE_DATA.MARKET_DATA;
  }
  if (url.includes(ENDPOINTS.SENTIMENT)) {
    return SAMPLE_DATA.SENTIMENT_DATA;
  }
  return {};
}

/**
 * Sample data for mock responses
 */
export const SAMPLE_DATA = {
  MARKET_DATA: {
    assets: [
      {
        symbol: 'US100',
        name: 'NASDAQ 100 Index',
        asset_type: 'index',
        current: {
          price: 14850.25,
          change: 98.75,
          change_percent: 0.67,
          high: 14900.50,
          low: 14750.00,
          volume: 1250000,
          updated_at: new Date().toISOString()
        }
      },
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        asset_type: 'crypto',
        current: {
          price: 36700.50,
          change: 775.25,
          change_percent: 2.15,
          high: 37000.00,
          low: 36000.00,
          volume: 2500000,
          updated_at: new Date().toISOString()
        }
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        asset_type: 'stock',
        current: {
          price: 187.25,
          change: -0.60,
          change_percent: -0.32,
          high: 188.00,
          low: 186.50,
          volume: 5000000,
          updated_at: new Date().toISOString()
        }
      },
      {
        symbol: 'EURUSD',
        name: 'Euro / US Dollar',
        asset_type: 'forex',
        current: {
          price: 1.0850,
          change: 0.0005,
          change_percent: 0.05,
          high: 1.0860,
          low: 1.0840,
          volume: 1000000,
          updated_at: new Date().toISOString()
        }
      },
      {
        symbol: 'GOLD',
        name: 'Gold Spot',
        asset_type: 'commodity',
        current: {
          price: 1950.75,
          change: 8.25,
          change_percent: 0.42,
          high: 1955.00,
          low: 1945.00,
          volume: 750000,
          updated_at: new Date().toISOString()
        }
      }
    ]
  },
  SENTIMENT_DATA: {
    assets: [
      {
        symbol: 'US100',
        name: 'NASDAQ 100',
        current_sentiment: {
          sentiment_score: 0.35,
          sentiment_label: 'positive',
          positive_ratio: 0.55,
          negative_ratio: 0.20,
          neutral_ratio: 0.25,
          key_phrases: ['tech rally', 'strong earnings', 'sector rotation'],
          updated_at: '2023-07-15T15:30:00Z'
        }
      },
      {
        symbol: 'US30',
        name: 'Dow Jones 30',
        current_sentiment: {
          sentiment_score: 0.25,
          sentiment_label: 'neutral',
          positive_ratio: 0.45,
          negative_ratio: 0.25,
          neutral_ratio: 0.30,
          key_phrases: ['economic outlook', 'interest rates', 'market stability'],
          updated_at: '2023-07-15T15:20:00Z'
        }
      },
      {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        current_sentiment: {
          sentiment_score: 0.65,
          sentiment_label: 'positive',
          positive_ratio: 0.70,
          negative_ratio: 0.15,
          neutral_ratio: 0.15,
          key_phrases: ['institutional adoption', 'crypto bull run', 'regulatory clarity'],
          updated_at: '2023-07-15T15:35:00Z'
        }
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        current_sentiment: {
          sentiment_score: -0.25,
          sentiment_label: 'negative',
          positive_ratio: 0.30,
          negative_ratio: 0.55,
          neutral_ratio: 0.15,
          key_phrases: ['earnings miss', 'production delays', 'competitive pressure'],
          updated_at: '2023-07-15T15:15:00Z'
        }
      },
      {
        symbol: 'GOLD',
        name: 'Gold',
        current_sentiment: {
          sentiment_score: 0.40,
          sentiment_label: 'positive',
          positive_ratio: 0.60,
          negative_ratio: 0.20,
          neutral_ratio: 0.20,
          key_phrases: ['safe haven', 'inflation hedge', 'central bank buying'],
          updated_at: '2023-07-15T15:25:00Z'
        }
      }
    ]
  },
  TRADING_SIGNALS: {
    assets: [
      {
        symbol: 'US100',
        name: 'NASDAQ 100',
        current_signal: {
          signal: 'BUY',
          signal_strength: 0.75,
          price: 14832.67,
          generated_at: '2023-07-15T15:30:00Z',
          key_indicators: {
            trend: 'bullish',
            rsi: 'moderate_buy',
            macd: 'strong_buy',
            moving_averages: 'buy'
          }
        }
      },
      {
        symbol: 'US30',
        name: 'Dow Jones 30',
        current_signal: {
          signal: 'HOLD',
          signal_strength: 0.50,
          price: 34302.61,
          generated_at: '2023-07-15T15:20:00Z',
          key_indicators: {
            trend: 'neutral',
            rsi: 'neutral',
            macd: 'buy',
            moving_averages: 'hold'
          }
        }
      },
      {
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        current_signal: {
          signal: 'BUY',
          signal_strength: 0.85,
          price: 36745.28,
          generated_at: '2023-07-15T15:35:00Z',
          key_indicators: {
            trend: 'strong_bullish',
            rsi: 'strong_buy',
            macd: 'strong_buy',
            moving_averages: 'strong_buy'
          }
        }
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        current_signal: {
          signal: 'SELL',
          signal_strength: 0.60,
          price: 187.32,
          generated_at: '2023-07-15T15:15:00Z',
          key_indicators: {
            trend: 'bearish',
            rsi: 'sell',
            macd: 'moderate_sell',
            moving_averages: 'sell'
          }
        }
      },
      {
        symbol: 'GOLD',
        name: 'Gold',
        current_signal: {
          signal: 'BUY',
          signal_strength: 0.80,
          price: 2019.65,
          generated_at: '2023-07-15T15:25:00Z',
          key_indicators: {
            trend: 'bullish',
            rsi: 'strong_buy',
            macd: 'buy',
            moving_averages: 'strong_buy'
          }
        }
      }
    ]
  }
};