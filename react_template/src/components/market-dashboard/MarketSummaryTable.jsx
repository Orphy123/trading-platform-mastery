import React, { useState, useEffect } from 'react';
import { getCurrentPrices } from '../../services/marketService';
import { getMultipleSignals } from '../../services/signalService';
import { formatPrice, formatChangePercent, formatDateTime } from '../../utils/format';
import SignalBadge from '../common/SignalBadge';

/**
 * Market Summary Table component for displaying asset data in a table format
 */
const MarketSummaryTable = ({ watchlist = [], showSignals = true }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'ascending' });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch asset data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If no watchlist provided, fetch all assets
        const symbols = watchlist.length > 0 ? watchlist : undefined;
        
        // Fetch current prices
        const pricesData = await getCurrentPrices(symbols);
        
        if (showSignals) {
          // Fetch signals for the same assets
          const signalsData = await getMultipleSignals(symbols);
          
          // Combine price and signal data
          const combinedData = pricesData.map(asset => {
            const signal = signalsData.signals.find(s => s.symbol === asset.symbol);
            return {
              ...asset,
              signal: signal?.signal || 'HOLD',
              signal_strength: signal?.signal_strength || 0.5
            };
          });
          
          setAssets(combinedData);
        } else {
          setAssets(pricesData);
        }
        
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [watchlist, showSignals]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Apply sorting to the assets data
  const sortedAssets = React.useMemo(() => {
    const sortableAssets = [...assets];
    
    if (sortConfig.key) {
      sortableAssets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableAssets;
  }, [assets, sortConfig]);

  // Get sort indicator
  const getSortDirectionIcon = (name) => {
    if (sortConfig.key !== name) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'ascending' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading && assets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex justify-center items-center text-red-500 dark:text-red-400 py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market Summary</h2>
        {lastUpdated && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatDateTime(lastUpdated)}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('symbol')}
              >
                <div className="flex items-center">
                  Symbol
                  <span className="ml-1">{getSortDirectionIcon('symbol')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('price')}
              >
                <div className="flex items-center justify-end">
                  Price
                  <span className="ml-1">{getSortDirectionIcon('price')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('change_percent')}
              >
                <div className="flex items-center justify-end">
                  24h Change
                  <span className="ml-1">{getSortDirectionIcon('change_percent')}</span>
                </div>
              </th>
              {showSignals && (
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('signal')}
                >
                  <div className="flex items-center justify-center">
                    Signal
                    <span className="ml-1">{getSortDirectionIcon('signal')}</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedAssets.length > 0 ? (
              sortedAssets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(asset.price, asset.symbol)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`inline-flex text-sm font-medium rounded-full px-2 py-0.5 ${
                        asset.change_percent > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : asset.change_percent < 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {formatChangePercent(asset.change_percent)}
                    </span>
                  </td>
                  {showSignals && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <SignalBadge
                        signal={asset.signal}
                        strength={asset.signal_strength}
                        size="sm"
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showSignals ? 4 : 3}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No asset data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketSummaryTable;