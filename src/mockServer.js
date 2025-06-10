import { createServer } from 'miragejs';

export function startMockServer() {
  createServer({
    routes() {
      // Handle asset parameters with slashes
      this.namespace = 'api';

      this.get('/chart/:asset', (schema, request) => {
        const { asset } = request.params;
        const { timeframe } = request.queryParams;
        
        // Generate sample candlestick data
        const data = [];
        const now = new Date();
        let basePrice = 1.0;
        
        for (let i = 100; i >= 0; i--) {
          const time = new Date(now - i * 60000); // 1 minute intervals
          const open = basePrice;
          const high = open * (1 + Math.random() * 0.02);
          const low = open * (1 - Math.random() * 0.02);
          const close = (high + low) / 2;
          
          data.push({
            time: time.getTime() / 1000,
            open,
            high,
            low,
            close,
          });
          
          basePrice = close;
        }
        
        return data;
      });

      this.get('/analysis/:asset', (schema, request) => {
        const { asset } = request.params;
        return {
          technicalIndicators: {
            rsi: Math.random() * 100,
            macd: {
              value: Math.random() * 2 - 1,
              signal: Math.random() * 2 - 1,
              histogram: Math.random() * 2 - 1,
            },
            bollingerBands: {
              upper: 1.1,
              middle: 1.0,
              lower: 0.9,
            },
          },
          mlPredictions: {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            confidence: Math.random() * 100,
            priceTarget: 1.0 + (Math.random() * 0.2 - 0.1),
          },
        };
      });

      this.get('/news/:asset', (schema, request) => {
        const { asset } = request.params;
        return {
          articles: [
            {
              title: `${asset} shows strong momentum`,
              source: 'Financial Times',
              publishedAt: new Date().toISOString(),
              sentiment: 0.8,
            },
            {
              title: `Analysts bullish on ${asset}`,
              source: 'Bloomberg',
              publishedAt: new Date().toISOString(),
              sentiment: 0.6,
            },
            {
              title: `${asset} trading at key levels`,
              source: 'Reuters',
              publishedAt: new Date().toISOString(),
              sentiment: 0.2,
            },
          ],
          overallSentiment: 0.5,
        };
      });
    },
  });
} 