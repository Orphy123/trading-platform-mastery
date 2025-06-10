// src/components/asset-detail/AssetChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { getAssetData } from '../../services/dashboardService';

function AssetChart({ symbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const [timeframe, setTimeframe] = useState('1d');
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bollinger: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAssetData(symbol, timeframe);
        
        if (chartRef.current) {
          chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Price series
        const priceSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        priceSeries.setData(data.price);

        // Add indicators based on selection
        if (indicators.sma) {
          const smaSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          smaSeries.setData(data.indicators.sma);
        }

        if (indicators.ema) {
          const emaSeries = chart.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 2,
          });
          emaSeries.setData(data.indicators.ema);
        }

        if (indicators.bollinger) {
          const upperSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
          });
          const middleSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
          });
          const lowerSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
          });
          upperSeries.setData(data.indicators.bollinger.upper);
          middleSeries.setData(data.indicators.bollinger.middle);
          lowerSeries.setData(data.indicators.bollinger.lower);
        }

        // Add ML prediction overlay
        if (data.ml_prediction) {
          const predictionSeries = chart.addLineSeries({
            color: '#9C27B0',
            lineWidth: 2,
            lineStyle: 2, // Dashed line
          });
          predictionSeries.setData(data.ml_prediction);
        }

        // Add RSI in a separate pane if selected
        if (indicators.rsi) {
          const rsiPane = chart.addPane(100);
          const rsiSeries = rsiPane.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 2,
          });
          rsiSeries.setData(data.indicators.rsi);
        }

        // Add MACD in a separate pane if selected
        if (indicators.macd) {
          const macdPane = chart.addPane(100);
          const macdSeries = macdPane.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          const signalSeries = macdPane.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 2,
          });
          macdSeries.setData(data.indicators.macd.macd);
          signalSeries.setData(data.indicators.macd.signal);
        }

        chartRef.current = chart;

        // Handle resize
        const handleResize = () => {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe, indicators]);

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-400 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timeframe Selection */}
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
          <button
            onClick={() => setTimeframe('3m')}
            className={`px-3 py-1 text-xs rounded-md ${
              timeframe === '3m'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            3M
          </button>
        </div>

        {/* Technical Indicators */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleIndicator('sma')}
            className={`px-3 py-1 text-xs rounded-md ${
              indicators.sma
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            SMA
          </button>
          <button
            onClick={() => toggleIndicator('ema')}
            className={`px-3 py-1 text-xs rounded-md ${
              indicators.ema
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            EMA
          </button>
          <button
            onClick={() => toggleIndicator('rsi')}
            className={`px-3 py-1 text-xs rounded-md ${
              indicators.rsi
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            RSI
          </button>
          <button
            onClick={() => toggleIndicator('macd')}
            className={`px-3 py-1 text-xs rounded-md ${
              indicators.macd
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            MACD
          </button>
          <button
            onClick={() => toggleIndicator('bollinger')}
            className={`px-3 py-1 text-xs rounded-md ${
              indicators.bollinger
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Bollinger
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}

export default AssetChart;