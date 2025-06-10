// src/services/sentimentService.js
import { API_BASE_URL, fetchWithErrorHandling, USE_MOCK_DATA, SAMPLE_DATA } from './apiConfig';

/**
 * Get latest sentiment analysis for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @returns {Promise<Object>} Sentiment analysis data
 */
export async function getLatestSentiment(symbol) {
  if (USE_MOCK_DATA) {
    const asset = SAMPLE_DATA.SENTIMENT_DATA.assets.find(a => a.symbol === symbol);
    
    if (asset) {
      return asset.current_sentiment;
    }
    
    // If asset not found in sentiment data, generate mock data
    return {
      sentiment_score: Math.random() * 2 - 1, // -1 to 1
      sentiment_label: Math.random() > 0.5 ? 'positive' : 'neutral',
      positive_ratio: Math.random() * 0.5 + 0.25,
      negative_ratio: Math.random() * 0.3 + 0.1,
      neutral_ratio: Math.random() * 0.3 + 0.1,
      key_phrases: ['market volatility', 'trading opportunity', 'technical levels'],
      updated_at: new Date().toISOString()
    };
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/sentiment/${encodeURIComponent(symbol)}`);
}

/**
 * Get historical sentiment data for a specific asset
 * @param {string} symbol - Asset symbol (e.g., 'BTC/USD')
 * @param {string} timeframe - Timeframe ('1h', '4h', '1d', '1w')
 * @param {number} limit - Number of data points to return
 * @returns {Promise<Object>} Historical sentiment data
 */
export async function getHistoricalSentiment(symbol, timeframe = '1d', limit = 30) {
  if (USE_MOCK_DATA) {
    const now = new Date();
    const asset = SAMPLE_DATA.SENTIMENT_DATA.assets.find(a => a.symbol === symbol);
    let baseScore = 0;
    
    if (asset) {
      baseScore = asset.current_sentiment.sentiment_score;
    }
    
    // Determine time interval in milliseconds based on timeframe
    let interval;
    switch (timeframe) {
      case '1h': interval = 60 * 60 * 1000; break;
      case '4h': interval = 4 * 60 * 60 * 1000; break;
      case '1w': interval = 7 * 24 * 60 * 60 * 1000; break;
      default: interval = 24 * 60 * 60 * 1000; // Default to 1d
    }
    
    // Generate historical sentiment data
    const data = [];
    for (let i = 0; i < limit; i++) {
      const time = new Date(now.getTime() - (i * interval));
      const randomFactor = Math.random() * 0.3 - 0.15; // -0.15 to 0.15
      const score = Math.max(-1, Math.min(1, baseScore + randomFactor));
      
      // Determine label based on score
      let sentimentLabel = 'neutral';
      if (score > 0.3) sentimentLabel = 'positive';
      else if (score < -0.3) sentimentLabel = 'negative';
      
      // Calculate ratios
      const positiveRatio = score > 0 ? 0.35 + (score * 0.3) : 0.35 - (Math.abs(score) * 0.15);
      const negativeRatio = score < 0 ? 0.35 + (Math.abs(score) * 0.3) : 0.35 - (score * 0.15);
      const neutralRatio = 1 - positiveRatio - negativeRatio;
      
      data.unshift({
        timestamp: Math.floor(time.getTime() / 1000),
        datetime: time.toISOString(),
        sentiment_score: score,
        sentiment_label: sentimentLabel,
        positive_ratio: positiveRatio,
        negative_ratio: negativeRatio,
        neutral_ratio: neutralRatio
      });
      
      // Apply some trend to make data more realistic
      if (i % 5 === 0) {
        const shift = (Math.random() > 0.5 ? 1 : -1) * 0.2;
        baseScore = Math.max(-0.8, Math.min(0.8, baseScore + shift));
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
    `${API_BASE_URL}/sentiment/history/${encodeURIComponent(symbol)}?timeframe=${timeframe}&limit=${limit}`
  );
}

/**
 * Get sentiment analysis for multiple assets
 * @param {string[]} symbols - Array of asset symbols
 * @returns {Promise<Array>} Sentiment data for requested assets
 */
export async function getMultiAssetSentiment(symbols) {
  if (USE_MOCK_DATA) {
    return symbols.map(symbol => {
      const asset = SAMPLE_DATA.SENTIMENT_DATA.assets.find(a => a.symbol === symbol);
      
      if (asset) {
        return {
          symbol,
          ...asset.current_sentiment
        };
      }
      
      // Generate random sentiment for missing assets
      return {
        symbol,
        sentiment_score: Math.random() * 2 - 1, // -1 to 1
        sentiment_label: Math.random() > 0.5 ? 'neutral' : (Math.random() > 0.5 ? 'positive' : 'negative'),
        positive_ratio: Math.random() * 0.5 + 0.25,
        negative_ratio: Math.random() * 0.3 + 0.1,
        neutral_ratio: Math.random() * 0.3 + 0.1,
        updated_at: new Date().toISOString()
      };
    });
  }
  
  return fetchWithErrorHandling(`${API_BASE_URL}/sentiment/multi`, {
    method: 'POST',
    body: JSON.stringify({ symbols })
  });
}