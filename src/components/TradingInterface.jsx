import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TradingInterface = () => {
  const [symbol, setSymbol] = useState('EUR/USD');
  const [marketData, setMarketData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [tradingSignal, setTradingSignal] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch market data
      const marketResponse = await fetch(`http://localhost:8000/api/market-data/${symbol}`);
      const marketData = await marketResponse.json();
      setMarketData(marketData);

      // Fetch sentiment
      const sentimentResponse = await fetch(`http://localhost:8000/api/sentiment/${symbol}`);
      const sentimentData = await sentimentResponse.json();
      setSentiment(sentimentData);

      // Fetch trading signal
      const signalResponse = await fetch(`http://localhost:8000/api/trading-signal/${symbol}`);
      const signalData = await signalResponse.json();
      setTradingSignal(signalData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [symbol]);

  const chartData = marketData ? {
    labels: marketData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Price',
        data: marketData.map(d => d.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  } : null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Trading Interface</h2>
        <div className="flex gap-4 mb-4">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="US100">US100</option>
            <option value="US30">US30</option>
          </select>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {chartData && (
        <div className="mb-6">
          <Line data={chartData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: `${symbol} Price Chart`,
              },
            },
          }} />
        </div>
      )}

      {tradingSignal && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-2">Trading Signal</h3>
            <div className={`text-xl font-bold ${
              tradingSignal.signal === 'BUY' ? 'text-green-600' : 'text-red-600'
            }`}>
              {tradingSignal.signal}
            </div>
            <div className="text-sm text-gray-600">
              Confidence: {(tradingSignal.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {sentiment && (
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="text-lg font-semibold mb-2">News Sentiment</h3>
              <div className="text-sm">
                <div>Compound Score: {sentiment.compound.toFixed(2)}</div>
                <div>Articles Analyzed: {sentiment.article_count}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradingInterface; 