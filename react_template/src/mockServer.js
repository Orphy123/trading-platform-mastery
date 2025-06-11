import { createServer } from 'miragejs';

// API Keys from environment variables
const TWELVEDATA_API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY;
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

// Validate API keys
if (!TWELVEDATA_API_KEY || !FINNHUB_API_KEY || !ALPHA_VANTAGE_API_KEY || !NEWS_API_KEY) {
  console.warn('Warning: Some API keys are missing. Please check your .env file.');
}

export function startMockServer() {
  return createServer({
    routes() {
      // Market data endpoints
      this.get('/api/market-data/:asset', (schema, request) => {
        const { asset } = request.params;
        // Simulate API call with real API key
        console.log(`Fetching market data for ${asset} using API key: ${TWELVEDATA_API_KEY ? 'Present' : 'Missing'}`);
        
        return {
          success: true,
          data: generateMockMarketData(asset)
        };
      });

      // News sentiment endpoints
      this.get('/api/news/:asset', (schema, request) => {
        const { asset } = request.params;
        // Simulate API call with real API key
        console.log(`Fetching news for ${asset} using API key: ${NEWS_API_KEY ? 'Present' : 'Missing'}`);
        
        return {
          success: true,
          data: generateMockNewsData(asset)
        };
      });

      // Technical analysis endpoints
      this.get('/api/analysis/:asset', (schema, request) => {
        const { asset } = request.params;
        // Simulate API call with real API key
        console.log(`Fetching analysis for ${asset} using API key: ${FINNHUB_API_KEY ? 'Present' : 'Missing'}`);
        
        return {
          success: true,
          data: generateMockAnalysisData(asset)
        };
      });
    },
  });
}

// Helper functions to generate mock data
function generateMockMarketData(asset) {
  const basePrice = 1.0;
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (100 - i) * 60;
    const price = basePrice + (Math.random() - 0.5) * 0.1;
    data.push({
      time: timestamp,
      open: price,
      high: price + Math.random() * 0.02,
      low: price - Math.random() * 0.02,
      close: price + (Math.random() - 0.5) * 0.01,
      volume: Math.floor(Math.random() * 1000)
    });
  }
  
  return data;
}

function generateMockNewsData(asset) {
  return {
    overallSentiment: Math.random() > 0.5 ? 'positive' : 'negative',
    sentimentScore: (Math.random() * 2 - 1).toFixed(2),
    articles: Array(5).fill(null).map((_, i) => ({
      title: `News about ${asset} - Article ${i + 1}`,
      source: ['Bloomberg', 'Reuters', 'CNBC', 'Financial Times'][Math.floor(Math.random() * 4)],
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
      sentimentScore: (Math.random() * 2 - 1).toFixed(2)
    }))
  };
}

function generateMockAnalysisData(asset) {
  return {
    technicalIndicators: {
      rsi: (Math.random() * 100).toFixed(2),
      macd: (Math.random() * 2 - 1).toFixed(2),
      bollingerBands: {
        upper: (1.1 + Math.random() * 0.1).toFixed(2),
        middle: (1.0 + Math.random() * 0.05).toFixed(2),
        lower: (0.9 - Math.random() * 0.1).toFixed(2)
      }
    },
    mlPredictions: {
      nextPrice: (1.0 + (Math.random() - 0.5) * 0.1).toFixed(2),
      confidence: (0.5 + Math.random() * 0.5).toFixed(2),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }
  };
} 