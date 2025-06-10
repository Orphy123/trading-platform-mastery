// src/components/market-dashboard/MarketOverview.jsx
import React, { useState, useEffect } from 'react';
import { getMarketSummary, getWatchlist } from '../../services/dashboardService';
import { formatCurrency, formatPercentage, getValueColor } from '../../utils/format';

function MarketOverview() {
  const [marketData, setMarketData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1d'); // '1d', '1w', '1m'

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch market summary data
        const summary = await getMarketSummary();
        setMarketData(summary);
        
        // Fetch user's watchlist
        const watchlistData = await getWatchlist();
        setWatchlist(watchlistData);
        
      } catch (err) {
        console.error('Error fetching market overview data:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Set up refresh interval (every 60 seconds)
    const refreshInterval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-lg font-medium">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Trend */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Market Trend</div>
          <div className="flex items-center justify-between">
            <div className={`text-xl font-bold ${getValueColor(marketData.market_trend.change)}`}>
              {marketData.market_trend.direction}
            </div>
            <div className={`text-sm ${getValueColor(marketData.market_trend.change)}`}>
              {formatPercentage(marketData.market_trend.change)}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {marketData.market_trend.description}
          </div>
        </div>
        
        {/* Volatility */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Market Volatility</div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {marketData.volatility.level}
            </div>
            <div className={`text-sm ${getVolatilityColor(marketData.volatility.level)}`}>
              {formatPercentage(marketData.volatility.value)}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {marketData.volatility.description}
          </div>
        </div>
        
        {/* Trading Volume */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Trading Volume (24h)</div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {formatCurrency(marketData.volume.total, 'USD')}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {marketData.volume.change > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(marketData.volume.change))} vs previous day
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Top Movers
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe('1d')}
              className={`px-3 py-1 text-xs rounded-md ${
                timeframe === '1d'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setTimeframe('1w')}
              className={`px-3 py-1 text-xs rounded-md ${
                timeframe === '1w'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              1W
            </button>
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-3 py-1 text-xs rounded-md ${
                timeframe === '1m'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              1M
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.top_movers[timeframe].map((asset, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{asset.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
                </div>
                <div className={`text-lg font-bold ${getValueColor(asset.change)}`}>
                  {formatPercentage(asset.change)}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                  {formatCurrency(asset.price, 'USD')}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Vol: {formatCurrency(asset.volume, 'USD')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Watchlist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Your Watchlist
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Manage Watchlist
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-xs">Symbol</th>
                <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-xs">Price</th>
                <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-xs">Change</th>
                <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-xs">Signal</th>
                <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((asset, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{asset.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
                  </td>
                  <td className="py-3 text-gray-800 dark:text-gray-200">
                    {formatCurrency(asset.price, 'USD')}
                  </td>
                  <td className={`py-3 ${getValueColor(asset.change)}`}>
                    {formatPercentage(asset.change)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSignalClasses(asset.signal)}`}>
                      {asset.signal}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {watchlist.length === 0 && (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 mb-2">Your watchlist is empty</div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Add assets to your watchlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for UI rendering
function getVolatilityColor(level) {
  switch (level.toLowerCase()) {
    case 'low':
      return 'text-green-600 dark:text-green-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'high':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function getSignalClasses(signal) {
  switch (signal.toLowerCase()) {
    case 'buy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'sell':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'hold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default MarketOverview;