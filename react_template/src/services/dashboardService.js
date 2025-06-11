// src/services/dashboardService.js
import { API_BASE_URL, fetchWithErrorHandling, USE_MOCK_DATA, SAMPLE_DATA } from './apiConfig';
import { getLatestSentiment } from './sentimentService';
import { getLatestSignal } from './signalService';
import { getCurrentPrice, getHistoricalData } from './marketService';
import { ENDPOINTS } from './apiConfig';

/**
 * Get market summary statistics and overview
 * @returns {Promise<Object>} Market summary data
 */
export async function getMarketSummary() {
  if (USE_MOCK_DATA) {
    const now = new Date();
    
    // Count assets by type in sample data
    const assetTypes = {};
    SAMPLE_DATA.MARKET_DATA.assets.forEach(asset => {
      if (!assetTypes[asset.asset_type]) {
        assetTypes[asset.asset_type] = 0;
      }
      assetTypes[asset.asset_type]++;
    });
    
    // Calculate average change by type
    const changeByType = {};
    SAMPLE_DATA.MARKET_DATA.assets.forEach(asset => {
      if (!changeByType[asset.asset_type]) {
        changeByType[asset.asset_type] = { sum: 0, count: 0 };
      }
      changeByType[asset.asset_type].sum += asset.current.change_percent;
      changeByType[asset.asset_type].count++;
    });
    
    Object.keys(changeByType).forEach(type => {
      changeByType[type] = changeByType[type].sum / changeByType[type].count;
    });

    // Calculate overall market trend
    const avgChange = SAMPLE_DATA.MARKET_DATA.assets.reduce((sum, asset) => 
      sum + asset.current.change_percent, 0) / SAMPLE_DATA.MARKET_DATA.assets.length;
    
    return {
      timestamp: now.toISOString(),
      market_trend: {
        direction: avgChange > 0 ? 'Upward' : 'Downward',
        change: avgChange,
        description: `Market is trending ${avgChange > 0 ? 'upward' : 'downward'} with an average change of ${Math.abs(avgChange).toFixed(2)}%`
      },
      volatility: {
        level: 'Moderate',
        value: 0.015,
        description: 'Market showing moderate volatility with normal trading patterns'
      },
      volume: {
        total: SAMPLE_DATA.MARKET_DATA.assets.reduce((sum, a) => sum + a.current.volume, 0),
        change: 0.05
      },
      top_movers: {
        '1d': SAMPLE_DATA.MARKET_DATA.assets
          .sort((a, b) => Math.abs(b.current.change_percent) - Math.abs(a.current.change_percent))
          .slice(0, 4)
          .map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: asset.current.price,
            change: asset.current.change_percent,
            volume: asset.current.volume
          })),
        '1w': SAMPLE_DATA.MARKET_DATA.assets
          .sort((a, b) => Math.abs(b.current.change_percent) - Math.abs(a.current.change_percent))
          .slice(0, 4)
          .map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: asset.current.price,
            change: asset.current.change_percent * 1.5, // Simulate weekly change
            volume: asset.current.volume * 5 // Simulate weekly volume
          })),
        '1m': SAMPLE_DATA.MARKET_DATA.assets
          .sort((a, b) => Math.abs(b.current.change_percent) - Math.abs(a.current.change_percent))
          .slice(0, 4)
          .map(asset => ({
            symbol: asset.symbol,
            name: asset.name,
            price: asset.current.price,
            change: asset.current.change_percent * 3, // Simulate monthly change
            volume: asset.current.volume * 20 // Simulate monthly volume
          }))
      },
      market_stats: {
        total_assets: SAMPLE_DATA.MARKET_DATA.assets.length,
        asset_types: assetTypes,
        trending_up: SAMPLE_DATA.MARKET_DATA.assets.filter(a => a.current.change_percent > 0).length,
        trending_down: SAMPLE_DATA.MARKET_DATA.assets.filter(a => a.current.change_percent < 0).length,
        total_volume: SAMPLE_DATA.MARKET_DATA.assets.reduce((sum, a) => sum + a.current.volume, 0),
      },
      sector_performance: Object.keys(changeByType).map(type => ({
        sector: type,
        change_percent: changeByType[type],
        assets_count: assetTypes[type]
      })),
      market_mood: calculateMarketMood(SAMPLE_DATA.MARKET_DATA.assets)
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/dashboard/summary`);
}

/**
 * Calculate overall market mood based on asset prices
 * @param {Array} assets - List of assets with change data
 * @returns {string} Market mood description
 */
function calculateMarketMood(assets) {
  const avgChange = assets.reduce((sum, asset) => sum + asset.current.change_percent, 0) / assets.length;
  const volatility = Math.sqrt(assets.reduce((sum, asset) => 
    sum + Math.pow(asset.current.change_percent - avgChange, 2), 0) / assets.length);
  
  if (avgChange > 1.5) return 'Euphoric';
  if (avgChange > 0.8) return 'Bullish';
  if (avgChange > 0.3) return 'Optimistic';
  if (avgChange > -0.3) return 'Neutral';
  if (avgChange > -0.8) return 'Cautious';
  if (avgChange > -1.5) return 'Bearish';
  return 'Fearful';
}

/**
 * Get user's watchlist assets
 * @returns {Promise<Array>} Watchlist assets with data
 */
export async function getWatchlist() {
  if (USE_MOCK_DATA) {
    // Default watchlist - in production this would come from user preferences
    const defaultWatchlist = ['BTC/USD', 'ETH/USD', 'US100', 'AAPL', 'GOLD'];
    
    return defaultWatchlist.map(symbol => {
      const asset = SAMPLE_DATA.MARKET_DATA.assets.find(a => a.symbol === symbol);
      if (!asset) return null;
      
      const sentiment = SAMPLE_DATA.SENTIMENT_DATA.assets.find(a => a.symbol === symbol);
      const signal = SAMPLE_DATA.TRADING_SIGNALS.assets.find(a => a.symbol === symbol);
      
      return {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.current.price,
        change_percent: asset.current.change_percent,
        updated_at: asset.current.updated_at,
        sentiment: sentiment ? sentiment.current_sentiment.sentiment_label : 'neutral',
        signal: signal ? signal.current_signal.signal : 'HOLD'
      };
    }).filter(Boolean);
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/watchlist`);
}

/**
 * Update user's watchlist (add or remove assets)
 * @param {string} symbol - Asset symbol to add/remove
 * @param {boolean} add - True to add, false to remove 
 * @returns {Promise<Object>} Updated watchlist
 */
export async function updateWatchlist(symbol, add = true) {
  if (USE_MOCK_DATA) {
    // In a real app, would store in localStorage or user preferences
    console.log(`${add ? 'Adding' : 'Removing'} ${symbol} ${add ? 'to' : 'from'} watchlist`);
    return { success: true };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ symbol, action: add ? 'add' : 'remove' })
  });
}

/**
 * Get simulated portfolio data
 * @returns {Promise<Object>} Portfolio data
 */
export async function getPortfolio() {
  if (USE_MOCK_DATA) {
    // Simulated portfolio
    const portfolio = {
      total_value: 25750.42,
      change_percent: 3.2,
      cash_balance: 5432.10,
      positions: [
        {
          symbol: 'BTC/USD',
          name: 'Bitcoin',
          quantity: 0.25,
          avg_price: 32400.00,
          current_price: 36745.28,
          value: 9186.32,
          profit_loss: 1086.32,
          profit_loss_percent: 13.41,
          allocation: 35.67
        },
        {
          symbol: 'ETH/USD',
          name: 'Ethereum',
          quantity: 2.5,
          avg_price: 2100.00,
          current_price: 2365.12,
          value: 5912.80,
          profit_loss: 662.80,
          profit_loss_percent: 12.62,
          allocation: 22.96
        },
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 15,
          avg_price: 190.50,
          current_price: 187.32,
          value: 2809.80,
          profit_loss: -47.70,
          profit_loss_percent: -1.67,
          allocation: 10.91
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corp',
          quantity: 5,
          avg_price: 320.75,
          current_price: 342.67,
          value: 1713.35,
          profit_loss: 109.60,
          profit_loss_percent: 6.83,
          allocation: 6.65
        },
        {
          symbol: 'GOLD',
          name: 'Gold',
          quantity: 0.3,
          avg_price: 1980.00,
          current_price: 2019.65,
          value: 605.90,
          profit_loss: 11.90,
          profit_loss_percent: 2.00,
          allocation: 2.35
        }
      ]
    };
    
    return portfolio;
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/portfolio`);
}

/**
 * Get performance metrics for dashboard
 * @returns {Promise<Object>} Performance metrics
 */
export async function getPerformanceMetrics() {
  if (USE_MOCK_DATA) {
    return {
      daily_gain_loss: 425.32,
      daily_gain_loss_percent: 1.68,
      weekly_gain_loss: 1245.67,
      weekly_gain_loss_percent: 5.08,
      monthly_gain_loss: 2756.42,
      monthly_gain_loss_percent: 12.35,
      ytd_gain_loss: 8432.65,
      ytd_gain_loss_percent: 42.45,
      performance_history: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        values: [21500, 22350, 21900, 23100, 24500, 23900, 25750]
      }
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/performance`);
}

/**
 * Get market news and notifications
 * @param {number} limit - Number of news items to return
 * @returns {Promise<Array>} Array of news/notification items
 */
export async function getNotifications(limit = 5) {
  if (USE_MOCK_DATA) {
    const notifications = [
      {
        id: 'n1',
        type: 'alert',
        title: 'Bitcoin breaks above $36,000',
        message: 'BTC/USD has increased by over 3.5% in the last 24 hours.',
        asset: 'BTC/USD',
        timestamp: '2023-07-15T14:30:00Z',
        is_read: false
      },
      {
        id: 'n2',
        type: 'news',
        title: 'Fed signals potential rate cut',
        message: 'Federal Reserve hints at possible interest rate cuts in upcoming meeting.',
        timestamp: '2023-07-15T12:45:00Z',
        is_read: true
      },
      {
        id: 'n3',
        type: 'signal',
        title: 'Buy Signal: Gold',
        message: 'Technical analysis indicates strong buy for Gold with 80% confidence.',
        asset: 'GOLD',
        timestamp: '2023-07-15T10:15:00Z',
        is_read: false
      },
      {
        id: 'n4',
        type: 'alert',
        title: 'Apple down 1.29%',
        message: 'AAPL shares dropped after reports of production delays for new models.',
        asset: 'AAPL',
        timestamp: '2023-07-15T09:30:00Z',
        is_read: true
      },
      {
        id: 'n5',
        type: 'news',
        title: 'Tech sector rallies',
        message: 'Technology stocks lead market gains amid positive earnings reports.',
        timestamp: '2023-07-14T16:20:00Z',
        is_read: true
      },
      {
        id: 'n6',
        type: 'signal',
        title: 'Sell Signal: AAPL',
        message: 'Technical indicators suggest a short-term sell for Apple shares.',
        asset: 'AAPL',
        timestamp: '2023-07-14T15:45:00Z',
        is_read: true
      },
      {
        id: 'n7',
        type: 'news',
        title: 'Oil prices stabilize',
        message: 'Crude oil shows reduced volatility following OPEC production announcement.',
        asset: 'CRUDE OIL',
        timestamp: '2023-07-14T13:10:00Z',
        is_read: true
      }
    ];
    
    return notifications.slice(0, limit);
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/notifications?limit=${limit}`);
}

/**
 * Mark notification as read
 * @param {string} notificationId - ID of notification to mark as read
 * @returns {Promise<Object>} Success response
 */
export async function markNotificationRead(notificationId) {
  if (USE_MOCK_DATA) {
    console.log(`Marking notification ${notificationId} as read`);
    return { success: true };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/user/notifications/${notificationId}/read`, {
    method: 'POST'
  });
}

// Mock data for dashboard
const generateMockDashboardData = (symbol) => {
  const basePrice = symbol.includes('BTC') ? 36700 : 
                   symbol.includes('ETH') ? 2370 : 
                   symbol.includes('US100') ? 14850 : 
                   symbol.includes('AAPL') ? 187 : 100;
  
  const priceChange = (Math.random() * 2 - 1) * (basePrice * 0.02);
  const newPrice = basePrice + priceChange;
  const changePercent = (priceChange / basePrice) * 100;

  return {
    price: {
      current: newPrice,
      change: priceChange,
      change_percent: changePercent,
      high: newPrice * 1.02,
      low: newPrice * 0.98,
      volume: Math.floor(Math.random() * 1000000)
    },
    signal: {
      signal: Math.random() > 0.5 ? 'buy' : 'sell',
      signal_strength: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
    },
    sentiment: {
      overall: Math.random() > 0.5 ? 'bullish' : 'bearish',
      score: Math.random() * 100,
      sources: {
        news: Math.random() * 100,
        social: Math.random() * 100,
        technical: Math.random() * 100
      }
    },
    ml_analysis: {
      accuracy: Math.floor(Math.random() * 20 + 80), // 80-100%
      precision: Math.floor(Math.random() * 20 + 80),
      recall: Math.floor(Math.random() * 20 + 80),
      factors: [
        { name: 'Price Momentum', importance: Math.floor(Math.random() * 30 + 70) },
        { name: 'Volume Trend', importance: Math.floor(Math.random() * 30 + 70) },
        { name: 'Market Sentiment', importance: Math.floor(Math.random() * 30 + 70) },
        { name: 'Technical Indicators', importance: Math.floor(Math.random() * 30 + 70) }
      ]
    }
  };
};

export const getAssetDashboard = async (symbol) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const asset = SAMPLE_DATA.MARKET_DATA.assets.find(a => a.symbol === symbol);
    if (!asset) {
      throw new Error(`Asset ${symbol} not found in mock data`);
    }
    
    // Generate mock ML analysis
    const mlAnalysis = {
      accuracy: 85 + Math.random() * 10, // 85-95%
      precision: 80 + Math.random() * 15, // 80-95%
      recall: 75 + Math.random() * 20, // 75-95%
      factors: [
        { name: 'Price Momentum', importance: 85 + Math.random() * 15 },
        { name: 'Volume Analysis', importance: 70 + Math.random() * 20 },
        { name: 'Market Sentiment', importance: 65 + Math.random() * 25 },
        { name: 'Technical Indicators', importance: 80 + Math.random() * 15 },
        { name: 'News Impact', importance: 60 + Math.random() * 30 }
      ]
    };
    
    // Generate mock trading signal
    const signalTypes = ['BUY', 'SELL', 'HOLD'];
    const signal = {
      signal: signalTypes[Math.floor(Math.random() * signalTypes.length)],
      signal_strength: 0.6 + Math.random() * 0.3, // 60-90% confidence
      generated_at: new Date().toISOString()
    };
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      current: asset.current,
      signal,
      ml_analysis: mlAnalysis,
      updated_at: new Date().toISOString()
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}${ENDPOINTS.ASSET_DASHBOARD}/${encodeURIComponent(symbol)}`);
};

// Technical Indicators
function calculateSMA(data, period) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(data, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = data.slice(0, period).reduce((acc, val) => acc + val.close, 0);
  ema.push(sum / period);
  
  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    ema.push((data[i].close - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  
  return ema;
}

function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI for first point
  let rs = avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));
  
  // Calculate RSI for remaining points
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    avgGain = ((avgGain * (period - 1)) + (change > 0 ? change : 0)) / period;
    avgLoss = ((avgLoss * (period - 1)) + (change < 0 ? -change : 0)) / period;
    
    rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine.map((value, i) => ({ close: value })), signalPeriod);
  
  // Calculate histogram
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
  
  return { macdLine, signalLine, histogram };
}

function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  const bands = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const standardDeviation = Math.sqrt(
      slice.reduce((acc, val) => acc + Math.pow(val.close - sma[i - period + 1], 2), 0) / period
    );
    
    bands.push({
      upper: sma[i - period + 1] + (multiplier * standardDeviation),
      middle: sma[i - period + 1],
      lower: sma[i - period + 1] - (multiplier * standardDeviation)
    });
  }
  
  return bands;
}

// Mock ML prediction generator
function generateMLPrediction(historicalData) {
  const lastPrice = historicalData[historicalData.length - 1].close;
  const volatility = 0.02; // 2% daily volatility
  const prediction = [];
  
  // Generate 7 days of predictions
  for (let i = 1; i <= 7; i++) {
    const randomFactor = Math.random() * 2 - 1; // -1 to 1
    const priceChange = lastPrice * volatility * randomFactor;
    prediction.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      price: lastPrice + priceChange,
      confidence: 0.7 + Math.random() * 0.2 // 70-90% confidence
    });
  }
  
  return prediction;
}

export async function getAssetData(symbol, timeframe = '1d') {
  try {
    const historicalData = await getHistoricalData(symbol, timeframe);
    
    // Format data for charting
    const chartData = historicalData.data.map(candle => ({
      time: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));
    
    // Calculate technical indicators
    const sma20 = calculateSMA(historicalData.data, 20);
    const ema50 = calculateEMA(historicalData.data, 50);
    const rsi = calculateRSI(historicalData.data);
    const macd = calculateMACD(historicalData.data);
    const bollingerBands = calculateBollingerBands(historicalData.data);
    
    // Generate ML prediction
    const prediction = generateMLPrediction(historicalData.data);
    
    return {
      chartData,
      indicators: {
        sma20,
        ema50,
        rsi,
        macd,
        bollingerBands
      },
      prediction,
      timeframe,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching asset data:', error);
    throw error;
  }
}