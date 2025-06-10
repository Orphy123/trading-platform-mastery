import React, { useState, useEffect } from 'react';
import { getLatestSentiment, getHistoricalSentiment } from '../../services/sentimentService';
import { formatDate } from '../../utils/format';

/**
 * Sentiment Gauge component to display sentiment analysis data
 */
const SentimentGauge = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch latest sentiment data
        const latestData = await getLatestSentiment(symbol);
        setSentimentData(latestData);
        
        // Fetch historical sentiment data
        const historicalData = await getHistoricalSentiment(symbol, 7);
        setHistoricalData(historicalData);
      } catch (err) {
        console.error(`Failed to fetch sentiment data for ${symbol}:`, err);
        setError(`Unable to load sentiment data for ${symbol}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchSentimentData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [symbol]);

  // Determine gauge position based on sentiment score
  const calculateGaugePosition = (score) => {
    // Convert -1 to 1 scale to 0-180 degrees
    return ((score + 1) / 2) * 180;
  };

  // Get color based on sentiment score
  const getSentimentColor = (score) => {
    if (score > 0.3) return '#4caf50'; // Green for positive
    if (score < -0.3) return '#f44336'; // Red for negative
    return '#ff9800'; // Amber for neutral
  };

  if (loading && !sentimentData) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="flex justify-center">
            <div className="h-40 w-40 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4 mx-auto"></div>
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Analysis: {symbol}</h2>
      </div>

      {sentimentData && (
        <div className="p-6">
          {/* Sentiment Score Gauge */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-48 h-24 mb-2">
              {/* Gauge background */}
              <div className="absolute w-full h-full bg-gray-100 dark:bg-gray-800 rounded-t-full overflow-hidden">
                {/* Negative section (Red) */}
                <div className="absolute top-0 left-0 w-1/3 h-full bg-red-100 dark:bg-red-900/30"></div>
                {/* Neutral section (Amber) */}
                <div className="absolute top-0 left-1/3 w-1/3 h-full bg-amber-100 dark:bg-amber-900/30"></div>
                {/* Positive section (Green) */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-green-100 dark:bg-green-900/30"></div>
              </div>
              
              {/* Gauge needle */}
              <div 
                className="absolute bottom-0 left-1/2 w-1 h-24 bg-gray-800 dark:bg-gray-200 origin-bottom transform -translate-x-1/2"
                style={{ rotate: `${calculateGaugePosition(sentimentData.sentiment_score)}deg` }}
              ></div>
              
              {/* Needle center point */}
              <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            {/* Sentiment Score Display */}
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: getSentimentColor(sentimentData.sentiment_score) }}>
                {(sentimentData.sentiment_score > 0 ? '+' : '') + sentimentData.sentiment_score.toFixed(2)}
              </div>
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200 capitalize">
                {sentimentData.sentiment_label}
              </div>
            </div>
          </div>
          
          {/* Sentiment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {(sentimentData.positive_ratio * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {(sentimentData.neutral_ratio * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {(sentimentData.negative_ratio * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          
          {/* Sources and Key Phrases */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Based on {sentimentData.article_count} news articles</h3>
            {sentimentData.key_phrases && sentimentData.key_phrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sentimentData.key_phrases.map((phrase, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Historical Sentiment Chart */}
          {historicalData && historicalData.data && historicalData.data.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Sentiment History (7 days)</h3>
              <div className="w-full h-20 relative">
                {/* Simple bar chart for historical sentiment */}
                <div className="flex items-end h-full justify-between">
                  {historicalData.data.map((day, index) => {
                    // Scale score to bar height (0-100%)
                    const barHeight = ((day.sentiment_score + 1) / 2) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full max-w-[20px] rounded-t" 
                          style={{ 
                            height: `${barHeight}%`, 
                            backgroundColor: getSentimentColor(day.sentiment_score) 
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(day.date, { day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Zero line */}
                <div className="absolute border-t border-dashed border-gray-300 dark:border-gray-700 w-full top-1/2"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentGauge;