import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchMarketData = async (asset, timeframe) => {
  try {
    const response = await api.get(`/api/market-data/${asset}`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const fetchTradingSignal = async (asset, timeframe) => {
  try {
    const response = await api.get(`/api/trading-signal/${asset}`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trading signal:', error);
    throw error;
  }
};

export const fetchNewsSentiment = async (asset) => {
  try {
    const response = await api.get(`/api/news-sentiment/${asset}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    throw error;
  }
};

export const subscribeToMarketData = (asset, timeframe, callback) => {
  const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/market-data`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      asset,
      timeframe
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return () => {
    ws.close();
  };
};

export const subscribeToTradingSignals = (asset, timeframe, callback) => {
  const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws/trading-signals`);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      asset,
      timeframe
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return () => {
    ws.close();
  };
};

export default api; 