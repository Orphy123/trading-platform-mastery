// src/components/common/AssetSelector.jsx
import React, { useState, useEffect, useRef } from 'react';

function AssetSelector({ selectedAsset, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Available assets for selection
  const assets = [
    { symbol: 'US100', name: 'NASDAQ 100 Index' },
    { symbol: 'SPX500', name: 'S&P 500 Index' },
    { symbol: 'US30', name: 'Dow Jones Industrial Average' },
    { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'EURUSD', name: 'Euro / US Dollar' },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar' },
    { symbol: 'GOLD', name: 'Gold Spot' },
    { symbol: 'OIL', name: 'Crude Oil' }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get the name of the selected asset
  const selectedAssetName = assets.find(asset => asset.symbol === selectedAsset)?.name || '';
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 md:w-56 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center overflow-hidden">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center text-blue-500 dark:text-blue-300 mr-2">
            <span className="text-xs font-bold">{selectedAsset.substring(0, 2)}</span>
          </div>
          <div className="truncate">
            <div className="font-medium text-gray-800 dark:text-gray-200">{selectedAsset}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedAssetName}</div>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-200"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <ul className="py-1">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <li key={asset.symbol}>
                  <button
                    className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedAsset === asset.symbol ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => {
                      onChange(asset.symbol);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center text-blue-500 dark:text-blue-300 mr-2">
                      <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{asset.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No assets found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AssetSelector;