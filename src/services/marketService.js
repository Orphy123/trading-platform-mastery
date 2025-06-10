// src/services/marketService.js
import { API_BASE_URL, fetchWithErrorHandling, USE_MOCK_DATA, SAMPLE_DATA } from './apiConfig';

/**
 * Get current price and information for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @returns {Promise<Object>} Current price data
 */
export async function getCurrentPrice(symbol) {
  if (USE_MOCK_DATA) {
    const asset = SAMPLE_DATA.MARKET_DATA.assets.find(a => a.symbol === symbol);
    if (!asset) {
      throw new Error(`Asset ${symbol} not found in mock data`);
    }
    return asset.current;
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/market/price/${encodeURIComponent(symbol)}`);
}

/**
 * Get historical price data for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @param {string} timeframe - Timeframe ('1m', '5m', '15m', '1h', '4h', '1d', '1w')
 * @param {number} limit - Number of data points to return
 * @returns {Promise<Object>} Historical price data
 */
export async function getHistoricalData(symbol, timeframe = '1d', limit = 100) {
  if (USE_MOCK_DATA) {
    // Generate mock historical data
    const now = new Date();
    const asset = SAMPLE_DATA.MARKET_DATA.assets.find(a => a.symbol === symbol);
    
    if (!asset) {
      throw new Error(`Asset ${symbol} not found in mock data`);
    }
    
    const currentPrice = asset.current.price;
    const volatility = 0.02; // 2% daily volatility
    const data = [];
    
    // Determine time interval in milliseconds based on timeframe
    let interval;
    switch (timeframe) {
      case '1m': interval = 60 * 1000; break;
      case '5m': interval = 5 * 60 * 1000; break;
      case '15m': interval = 15 * 60 * 1000; break;
      case '1h': interval = 60 * 60 * 1000; break;
      case '4h': interval = 4 * 60 * 60 * 1000; break;
      case '1d': interval = 24 * 60 * 60 * 1000; break;
      case '1w': interval = 7 * 24 * 60 * 60 * 1000; break;
      default: interval = 24 * 60 * 60 * 1000; // Default to 1d
    }
    
    // Generate data points working backward from current time
    let price = currentPrice;
    for (let i = 0; i < limit; i++) {
      const time = new Date(now.getTime() - (i * interval));
      
      // Random price movement with some trend
      const randomFactor = Math.random() * 2 - 1; // -1 to 1
      const priceChange = price * volatility * randomFactor;
      const open = price;
      price = open + priceChange;
      
      // Create OHLC data
      const high = Math.max(open, price) * (1 + Math.random() * 0.01);
      const low = Math.min(open, price) * (1 - Math.random() * 0.01);
      const volume = Math.round(Math.random() * 1000000) + 500000;
      
      data.unshift({
        datetime: time.toISOString(),
        timestamp: Math.floor(time.getTime() / 1000),
        open,
        high,
        low,
        close: price,
        volume
      });
      
      // Add some trend bias
      if (i % 20 === 0) {
        const trendShift = (Math.random() > 0.5 ? 1 : -1) * currentPrice * 0.03;
        price += trendShift;
      }
    }
    
    return {
      symbol,
      timeframe,
      data,
      updated_at: now.toISOString()
    };
  }
  
  return fetchWithErrorHandling(
    `${API_BASE_URL}/market/history/${encodeURIComponent(symbol)}?timeframe=${timeframe}&limit=${limit}`
  );
}

/**
 * Get market data for multiple assets
 * @param {string[]} symbols - Array of asset symbols
 * @returns {Promise<Array>} Array of price data for requested assets
 */
export async function getMultipleAssetData(symbols) {
  if (USE_MOCK_DATA) {
    const results = symbols.map(symbol => {
      const asset = SAMPLE_DATA.MARKET_DATA.assets.find(a => a.symbol === symbol);
      if (!asset) {
        return null;
      }
      
      return {
        symbol,
        name: asset.name,
        price: asset.current.price,
        change: asset.current.change,
        change_percent: asset.current.change_percent,
        updated_at: asset.current.updated_at
      };
    }).filter(Boolean);
    
    return results;
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/market/prices`, {
    method: 'POST',
    body: JSON.stringify({ symbols })
  });
}

/**
 * Get market data for top gainers and losers
 * @param {number} limit - Number of assets to return
 * @returns {Promise<Object>} Top gainers and losers data
 */
export async function getTopMovers(limit = 5) {
  if (USE_MOCK_DATA) {
    const assets = [...SAMPLE_DATA.MARKET_DATA.assets];
    
    // Sort by change percentage
    const sorted = assets.sort((a, b) => 
      Math.abs(b.current.change_percent) - Math.abs(a.current.change_percent)
    );
    
    // Get top gainers (positive change)
    const gainers = sorted
      .filter(asset => asset.current.change_percent > 0)
      .slice(0, limit)
      .map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.current.price,
        change: asset.current.change,
        change_percent: asset.current.change_percent
      }));
    
    // Get top losers (negative change)
    const losers = sorted
      .filter(asset => asset.current.change_percent < 0)
      .slice(0, limit)
      .map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.current.price,
        change: asset.current.change,
        change_percent: asset.current.change_percent
      }));
    
    return {
      gainers,
      losers,
      updated_at: new Date().toISOString()
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/market/movers?limit=${limit}`);
}

/**
 * Search for assets by name or symbol
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching assets
 */
export async function searchAssets(query) {
  if (USE_MOCK_DATA) {
    const lowerQuery = query.toLowerCase();
    
    return SAMPLE_DATA.MARKET_DATA.assets
      .filter(asset => 
        asset.symbol.toLowerCase().includes(lowerQuery) || 
        asset.name.toLowerCase().includes(lowerQuery)
      )
      .map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.current.price,
        asset_type: asset.asset_type
      }));
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/market/search?q=${encodeURIComponent(query)}`);
}