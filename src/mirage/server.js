import { createServer } from 'miragejs';

let server = null;

export function makeServer({ environment = 'development' } = {}) {
  if (server) {
    server.shutdown();
  }

  server = createServer({
    environment,

    routes() {
      this.namespace = 'api';

      // Chart data endpoint
      this.get('/chart/:symbol', (schema, request) => {
        const { symbol } = request.params;
        const { timeframe } = request.queryParams;
        
        // Generate mock chart data
        return {
          symbol,
          timeframe,
          data: Array.from({ length: 100 }, (_, i) => ({
            time: new Date(Date.now() - (100 - i) * 3600000).toISOString(),
            open: 1.0 + Math.random() * 0.1,
            high: 1.1 + Math.random() * 0.1,
            low: 0.9 + Math.random() * 0.1,
            close: 1.0 + Math.random() * 0.1,
            volume: Math.floor(Math.random() * 1000000)
          }))
        };
      });

      // Analysis endpoint
      this.get('/analysis/:symbol', (schema, request) => {
        const { symbol } = request.params;
        const { timeframe } = request.queryParams;

        return {
          technicalIndicators: {
            rsi: 45 + Math.random() * 30,
            macd: {
              histogram: (Math.random() - 0.5) * 2,
              signal: (Math.random() - 0.5) * 2,
              macd: (Math.random() - 0.5) * 2
            }
          },
          mlPredictions: {
            trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
            nextPrice: 1.0 + (Math.random() - 0.5) * 0.1,
            confidence: 0.5 + Math.random() * 0.5
          }
        };
      });

      // News endpoint
      this.get('/news/:symbol', (schema, request) => {
        const { symbol } = request.params;

        const mockArticles = [
          {
            title: `${symbol} shows strong momentum in recent trading`,
            source: 'Financial Times',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            sentiment: 'positive'
          },
          {
            title: `Analysts predict ${symbol} volatility in coming weeks`,
            source: 'Bloomberg',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            sentiment: 'neutral'
          },
          {
            title: `${symbol} faces headwinds from market uncertainty`,
            source: 'Reuters',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            sentiment: 'negative'
          }
        ];

        return {
          overallSentiment: {
            label: 'neutral',
            score: 0.5
          },
          articles: mockArticles
        };
      });
    }
  });

  return server;
} 