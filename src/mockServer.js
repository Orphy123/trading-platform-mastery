import { createServer } from 'miragejs';

export function startMockServer() {
  createServer({
    routes() {
      this.get('/api/chart/:asset', (schema, request) => {
        const { asset } = request.params;
        const { timeframe } = request.queryParams;
        
        // Generate sample candlestick data
        const data = [];
        let basePrice = 100;
        const now = new Date();
        
        for (let i = 0; i < 100; i++) {
          const time = new Date(now - (100 - i) * 24 * 60 * 60 * 1000);
          const open = basePrice + Math.random() * 10 - 5;
          const high = open + Math.random() * 5;
          const low = open - Math.random() * 5;
          const close = (high + low) / 2;
          
          data.push({
            time: time.toISOString().split('T')[0],
            open,
            high,
            low,
            close
          });
          
          basePrice = close;
        }
        
        return { data };
      });

      this.get('/api/analysis/:asset', (schema, request) => {
        const { asset } = request.params;
        const { timeframe } = request.queryParams;
        
        return {
          technicalIndicators: {
            rsi: 65.4,
            macd: { value: 0.5, signal: 0.3, histogram: 0.2 },
            bollingerBands: {
              upper: 1.2345,
              middle: 1.2000,
              lower: 1.1655
            }
          },
          mlPredictions: {
            nextPrice: 1.2150,
            confidence: 0.85,
            trend: 'bullish'
          }
        };
      });

      this.get('/api/news/:asset', (schema, request) => {
        const { asset } = request.params;
        
        return {
          articles: [
            {
              title: 'Market Analysis: ' + asset + ' Shows Strong Momentum',
              source: 'Financial Times',
              sentiment: 'positive',
              publishedAt: '2024-01-10T10:00:00Z'
            },
            {
              title: 'Technical Outlook: ' + asset + ' Faces Resistance',
              source: 'Bloomberg',
              sentiment: 'neutral',
              publishedAt: '2024-01-10T09:30:00Z'
            }
          ],
          overallSentiment: {
            score: 0.65,
            label: 'positive'
          }
        };
      });
    }
  });
} 