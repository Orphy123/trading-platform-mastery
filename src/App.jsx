import { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import AssetChart from './components/asset-detail/AssetChart';
import MarketOverview from './components/market-dashboard/MarketOverview';
import SignalBadge from './components/common/SignalBadge';
import SentimentBadge from './components/common/SentimentBadge';
import websocketService from './services/websocketService';
import { getAssetDashboard } from './services/dashboardService';
import { applyTheme, initializeTheme } from './utils/theme';

function App() {
  const [selectedAsset, setSelectedAsset] = useState('US100');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assetData, setAssetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analysis', 'signals'

  // Initialize theme
  useEffect(() => {
    initializeTheme();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    websocketService.connect([selectedAsset]);
    
    return () => {
      websocketService.disconnect();
    };
  }, [selectedAsset]);

  // Fetch asset data when selected asset changes
  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setIsLoading(true);
        const data = await getAssetDashboard(selectedAsset);
        setAssetData(data);
      } catch (error) {
        console.error('Error fetching asset data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssetData();
  }, [selectedAsset]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          selectedAsset={selectedAsset} 
          setSelectedAsset={setSelectedAsset}
          toggleSidebar={toggleSidebar}
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            {/* Asset Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {selectedAsset} Trading Analysis
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Real-time market data and ML-powered trading signals
                </p>
              </div>
              {assetData && assetData.signal && (
                <div className="flex items-center space-x-4">
                  <SignalBadge 
                    signal={assetData.signal.signal} 
                    strength={assetData.signal.signal_strength}
                    size="lg"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {(assetData.signal.signal_strength * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Market Overview
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analysis'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Technical Analysis
                </button>
                <button
                  onClick={() => setActiveTab('signals')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'signals'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ML Signals
                </button>
              </nav>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Market Overview */}
                {activeTab === 'overview' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <MarketOverview />
                  </div>
                )}

                {/* Technical Analysis */}
                {activeTab === 'analysis' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Technical Analysis
                    </h2>
                    <AssetChart symbol={selectedAsset} />
                  </div>
                )}

                {/* ML Signals */}
                {activeTab === 'signals' && assetData && assetData.ml_analysis && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Machine Learning Analysis
                    </h2>
                    <div className="space-y-6">
                      {/* Model Performance */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Model Performance
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {assetData.ml_analysis.accuracy}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {assetData.ml_analysis.precision}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Precision</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {assetData.ml_analysis.recall}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Recall</div>
                          </div>
                        </div>
                      </div>

                      {/* Key Factors */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Key Decision Factors
                        </h3>
                        <div className="space-y-3">
                          {assetData.ml_analysis.factors.map((factor, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{factor.name}</span>
                              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                                  style={{ width: `${factor.importance}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Risk Assessment
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Market Volatility</span>
                            <span className={`text-sm font-medium ${getRiskColor(assetData.ml_analysis.risk.volatility)}`}>
                              {assetData.ml_analysis.risk.volatility}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Trend Strength</span>
                            <span className={`text-sm font-medium ${getRiskColor(assetData.ml_analysis.risk.trend_strength)}`}>
                              {assetData.ml_analysis.risk.trend_strength}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Risk</span>
                            <span className={`text-sm font-medium ${getRiskColor(assetData.ml_analysis.risk.overall)}`}>
                              {assetData.ml_analysis.risk.overall}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Sentiment Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Market Sentiment
                  </h2>
                  <div className="flex justify-center items-center mb-4">
                    {assetData && assetData.sentiment ? (
                      <SentimentBadge 
                        score={assetData.sentiment.sentiment_score} 
                        label={assetData.sentiment.sentiment_label}
                        size="lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-8 border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg text-gray-500 dark:text-gray-400">No data</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {assetData && assetData.sentiment && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Positive:</span>
                        <span className="text-gray-700 dark:text-gray-300">{(assetData.sentiment.positive_ratio * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Negative:</span>
                        <span className="text-gray-700 dark:text-gray-300">{(assetData.sentiment.negative_ratio * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Neutral:</span>
                        <span className="text-gray-700 dark:text-gray-300">{(assetData.sentiment.neutral_ratio * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
                      Set Price Alert
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium">
                      Add to Watchlist
                    </button>
                    <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium">
                      Export Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            © 2023 Trading Assistant Platform. All Rights Reserved. For educational purposes only.
          </div>
        </footer>
      </div>
    </div>
  );
}

// Helper function for risk assessment colors
function getRiskColor(risk) {
  switch (risk.toLowerCase()) {
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

export default App;