# Trading Assistant Platform - Frontend Integration Guide

## Architecture Overview

The Trading Assistant Platform uses a modular architecture with a clear separation between the data processing backend and the frontend user interface:

```
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|  Data Sources     |----->|  Data Processing  |----->|  Frontend UI      |
|  - Market APIs    |      |  - Aggregation    |      |  - Dashboard      |
|  - News Sources   |      |  - Sentiment      |      |  - Charts         |
|  - Historical DB  |      |  - ML Predictions |      |  - Notifications  |
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
```

## Integration Strategy

### 1. API-First Approach
The backend exposes all functionality through RESTful APIs, documented in `api_specification.md`. This allows the frontend to be developed independently and ensures a clean separation of concerns.

### 2. Real-Time Updates
For real-time data updates, we use a WebSocket connection to push updates to the frontend as they happen, reducing the need for constant polling.

### 3. Responsive Design
The dashboard layout is designed to be responsive, with different configurations for desktop, tablet, and mobile views, as defined in `dashboard_ui_config.json`.

## Integration Steps

### Step 1: Environment Setup

1. Configure the API base URL in your frontend environment:
   ```javascript
   const API_BASE_URL = 'http://api.trading-assistant.com/v1';
   const WS_URL = 'wss://api.trading-assistant.com/v1/ws';
   ```

2. Set up API authentication:
   ```javascript
   const headers = {
     'X-API-Key': 'your_api_key_here',
     'Content-Type': 'application/json'
   };
   ```

### Step 2: Implement API Service Layer

Create service modules for each API category:

```javascript
// marketDataService.js
export async function getCurrentPrice(symbol) {
  const response = await fetch(`${API_BASE_URL}/market/price/${symbol}`, { headers });
  return response.json();
}

export async function getHistoricalData(symbol, interval, from, to, limit) {
  const params = new URLSearchParams({ interval, from, to, limit }).toString();
  const response = await fetch(`${API_BASE_URL}/market/history/${symbol}?${params}`, { headers });
  return response.json();
}

// sentimentService.js
export async function getLatestSentiment(symbol) {
  const response = await fetch(`${API_BASE_URL}/sentiment/latest/${symbol}`, { headers });
  return response.json();
}

// signalService.js
export async function getLatestSignal(symbol) {
  const response = await fetch(`${API_BASE_URL}/signals/latest/${symbol}`, { headers });
  return response.json();
}

// dashboardService.js
export async function getDashboardSummary(assets) {
  const params = assets ? new URLSearchParams({ assets }).toString() : '';
  const response = await fetch(`${API_BASE_URL}/dashboard/summary?${params}`, { headers });
  return response.json();
}
```

### Step 3: Set Up WebSocket for Real-Time Updates

```javascript
// websocketService.js
export function setupWebSocket(handlers) {
  const ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Subscribe to topics
    ws.send(JSON.stringify({
      action: 'subscribe',
      topics: ['price:EUR/USD', 'sentiment:US100', 'signal:US100']
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Route the message to the appropriate handler
    if (data.type === 'price_update' && handlers.onPriceUpdate) {
      handlers.onPriceUpdate(data);
    } else if (data.type === 'sentiment_update' && handlers.onSentimentUpdate) {
      handlers.onSentimentUpdate(data);
    } else if (data.type === 'signal_update' && handlers.onSignalUpdate) {
      handlers.onSignalUpdate(data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after a delay
    setTimeout(() => setupWebSocket(handlers), 5000);
  };
  
  return {
    subscribe: (topic) => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        topics: [topic]
      }));
    },
    unsubscribe: (topic) => {
      ws.send(JSON.stringify({
        action: 'unsubscribe',
        topics: [topic]
      }));
    },
    close: () => ws.close()
  };
}
```

### Step 4: Implement UI Components Using Sample Data

Use the provided sample data files to develop and test UI components:

```javascript
// Example: Market Overview Table
import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../services/dashboardService';
import sampleData from '../sample_data/sample_market_data.json'; // For development

function MarketOverview() {
  const [marketData, setMarketData] = useState(sampleData); // Start with sample data
  
  useEffect(() => {
    // In production, replace with:
    // getDashboardSummary().then(data => setMarketData(data));
    
    // For development, use sample data directly
    setMarketData(sampleData);
  }, []);
  
  return (
    <div className="market-overview">
      <h2>Market Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Change</th>
            <th>Sentiment</th>
            <th>Signal</th>
            <th>Strength</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {marketData.assets.map((asset) => (
            <tr key={asset.symbol}>
              <td>{asset.symbol}</td>
              <td>{asset.current.price}</td>
              <td className={asset.current.change_percent >= 0 ? 'positive' : 'negative'}>
                {asset.current.change_percent}%
              </td>
              <td>
                <span className={`sentiment ${asset.sentiment_label}`}>
                  {asset.sentiment_label}
                </span>
              </td>
              <td>
                <span className={`signal ${asset.signal}`}>
                  {asset.signal}
                </span>
              </td>
              <td>
                <div className="strength-bar" style={{ width: `${asset.signal_strength * 100}%` }}></div>
              </td>
              <td>
                <button>Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Data Visualization Recommendations

### Price Charts
Use a library like Chart.js, Highcharts, or TradingView for displaying price data and technical indicators.

```javascript
// Example: Asset Chart with TradingView
import React, { useEffect, useRef } from 'react';

function AssetChart({ symbol, interval }) {
  const container = useRef();
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        container_id: container.current.id,
        symbol: symbol,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        save_image: false,
        studies: ['MASimple@tv-basicstudies','RSI@tv-basicstudies','MACD@tv-basicstudies'],
      });
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, interval]);
  
  return <div ref={container} id="tradingview_widget" style={{ height: '500px' }} />;
}
```

### Sentiment Visualization
Use gauge charts or heatmaps to visualize sentiment data:

```javascript
// Example: Sentiment Gauge
import React from 'react';
import { Gauge } from 'react-gauge-chart';
import { getLatestSentiment } from '../services/sentimentService';

function SentimentGauge({ symbol }) {
  const [sentiment, setSentiment] = useState(null);
  
  useEffect(() => {
    getLatestSentiment(symbol).then(data => setSentiment(data));
  }, [symbol]);
  
  if (!sentiment) return <div>Loading sentiment data...</div>;
  
  // Convert -1 to 1 range to 0 to 1 for the gauge
  const normalizedScore = (sentiment.sentiment_score + 1) / 2;
  
  return (
    <div className="sentiment-gauge">
      <h3>Sentiment: {symbol}</h3>
      <Gauge
        percent={normalizedScore}
        needleColor="#756ab6"
        colors={['#ff0000', '#ffbf00', '#00ff00']}
      />
      <div className="sentiment-details">
        <p>Score: {sentiment.sentiment_score.toFixed(2)}</p>
        <p>Articles: {sentiment.article_count}</p>
        <div className="ratio-breakdown">
          <div className="positive" style={{ width: `${sentiment.positive_ratio * 100}%` }}></div>
          <div className="neutral" style={{ width: `${sentiment.neutral_ratio * 100}%` }}></div>
          <div className="negative" style={{ width: `${sentiment.negative_ratio * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
}
```

### Trading Signals Display
Create clear visual indicators for trading signals:

```javascript
// Example: Signal Indicator
import React from 'react';

function SignalIndicator({ signal, strength }) {
  const getColor = () => {
    switch(signal) {
      case 'BUY': return '#4caf50';
      case 'SELL': return '#f44336';
      default: return '#ffc107';
    }
  };
  
  return (
    <div className="signal-indicator">
      <div className="signal-badge" style={{ backgroundColor: getColor() }}>
        {signal}
      </div>
      <div className="signal-strength">
        <div className="strength-bar" 
             style={{ width: `${strength * 100}%`, backgroundColor: getColor() }}>
        </div>
        <span>{(strength * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
```

## Error Handling Strategy

1. **API Request Errors**
   ```javascript
   async function fetchWithErrorHandling(url, options) {
     try {
       const response = await fetch(url, options);
       
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'API request failed');
       }
       
       return await response.json();
     } catch (error) {
       console.error('API Error:', error);
       // Show user-friendly error notification
       showErrorNotification(error.message);
       throw error;
     }
   }
   ```

2. **Fallback Data Strategy**
   When API requests fail, use cached data or default placeholders:
   ```javascript
   function useFallbackData(apiCall, initialData) {
     const [data, setData] = useState(initialData);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       apiCall()
         .then(setData)
         .catch(err => {
           setError(err);
           // Keep using the last successful data
         });
     }, [apiCall]);
     
     return { data, error };
   }
   ```

## Performance Considerations

1. **Minimize API Calls**
   Implement caching strategies and use WebSockets for real-time updates instead of frequent polling.

2. **Lazy Loading**
   Load data and components only when needed:
   ```javascript
   const AssetDetail = React.lazy(() => import('./components/AssetDetail'));
   
   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <AssetDetail symbol="US100" />
       </Suspense>
     );
   }
   ```

3. **Data Throttling**
   For frequently changing data like prices, throttle UI updates to prevent excessive re-rendering:
   ```javascript
   function useThrottledState(initialValue, delay) {
     const [displayValue, setDisplayValue] = useState(initialValue);
     const latestValue = useRef(initialValue);
     
     useEffect(() => {
       const handler = setInterval(() => {
         if (latestValue.current !== displayValue) {
           setDisplayValue(latestValue.current);
         }
       }, delay);
       
       return () => clearInterval(handler);
     }, [delay, displayValue]);
     
     const setValue = useCallback(newValue => {
       latestValue.current = newValue;
     }, []);
     
     return [displayValue, setValue];
   }
   ```

## Testing with Sample Data

During development, use the provided sample data files for testing:

1. Import sample data files directly in your components for development
2. Create a mock API service for testing:
   ```javascript
   // mockApiService.js
   import marketData from '../sample_data/sample_market_data.json';
   import sentimentData from '../sample_data/sample_sentiment_data.json';
   import signalData from '../sample_data/sample_trading_signals.json';
   
   export function getCurrentPrice(symbol) {
     const asset = marketData.assets.find(a => a.symbol === symbol);
     return Promise.resolve(asset ? asset.current : null);
   }
   
   export function getLatestSentiment(symbol) {
     const asset = sentimentData.assets.find(a => a.symbol === symbol);
     return Promise.resolve(asset ? asset.current_sentiment : null);
   }
   
   // ... other mock methods
   ```

3. Switch between mock and real API services based on environment:
   ```javascript
   // apiService.js
   import * as realApi from './realApiService';
   import * as mockApi from './mockApiService';
   
   const api = process.env.REACT_APP_USE_MOCK_API === 'true' ? mockApi : realApi;
   export default api;
   ```

## Next Steps

1. Review the API specification in `api_specification.md`
2. Explore the sample data formats in the JSON files
3. Use the dashboard configuration in `dashboard_ui_config.json` as a reference for UI layout
4. Begin implementing the service layer using mock data
5. Develop UI components based on the recommended structure
