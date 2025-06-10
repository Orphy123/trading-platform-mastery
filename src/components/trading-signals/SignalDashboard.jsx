import React, { useState, useEffect } from 'react';
import { getLatestSignal, getSignalHistory, getSignalColor, formatSignalStrength } from '../../services/signalService';
import { formatPrice, formatDateTime, formatDate } from '../../utils/format';
import SignalBadge from '../common/SignalBadge';

/**
 * Signal Dashboard component for displaying trading signals and historical data
 */
const SignalDashboard = ({ symbol }) => {
  const [signalData, setSignalData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignalData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch latest signal data
        const latestData = await getLatestSignal(symbol);
        setSignalData(latestData);
        
        // Fetch signal history
        const history = await getSignalHistory(symbol, 10);
        setHistoryData(history);
      } catch (err) {
        console.error(`Failed to fetch signal data for ${symbol}:`, err);
        setError(`Unable to load signal data for ${symbol}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSignalData();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchSignalData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [symbol]);

  // Calculate price target based on signal
  const calculatePriceTarget = (signal, price, strength) => {
    if (!signal || !price) return null;
    
    const direction = signal === 'BUY' ? 1 : signal === 'SELL' ? -1 : 0;
    if (direction === 0) return null;
    
    // Simple calculation: adjusted by signal strength
    const movePercent = strength * 0.02 + 0.01; // Range of 1% to 3%
    return price * (1 + (direction * movePercent));
  };

  if (loading && !signalData) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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

  const priceTarget = signalData ? calculatePriceTarget(
    signalData.signal, 
    signalData.price, 
    signalData.signal_strength
  ) : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Signals: {symbol}</h2>
      </div>

      {signalData && (
        <div className="p-6">
          {/* Current Signal */}
          <div className="mb-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Signal</h3>
                <SignalBadge 
                  signal={signalData.signal} 
                  strength={signalData.signal_strength} 
                  size="lg"
                />
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(signalData.datetime)}
                </div>
              </div>
              
              {/* Price Information */}
              <div className="flex flex-col items-center sm:items-end">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Price at Signal</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(signalData.price, symbol)}
                </div>
                {priceTarget && signalData.signal !== 'HOLD' && (
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Target: </span>
                    <span className="font-medium" style={{ color: getSignalColor(signalData.signal) }}>
                      {formatPrice(priceTarget, symbol)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Signal Components */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Signal Composition</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {signalData.factors && Object.entries(signalData.factors).map(([factor, weight]) => (
                <div key={factor} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{factor}</div>
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${weight * 100}%`,
                          backgroundColor: getSignalColor(signalData.signal)
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">{(weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key Indicators */}
          {signalData.key_indicators && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Technical Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(signalData.key_indicators).map(([indicator, value]) => (
                  <div key={indicator} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{indicator.replace('_', ' ')}</div>
                    <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Historical Signals */}
          {historyData && historyData.signals && historyData.signals.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Signal History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Signal
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Strength
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {historyData.signals.map((signal, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(signal.datetime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <SignalBadge signal={signal.signal} size="sm" showStrength={false} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          {formatPrice(signal.price, symbol)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-right text-gray-500 dark:text-gray-400">
                          {formatSignalStrength(signal.signal_strength)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignalDashboard;