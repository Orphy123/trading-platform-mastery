// src/utils/storage.js

/**
 * Storage utilities for the Trading Assistant Platform
 */

const STORAGE_PREFIX = 'trading_assistant_';

/**
 * Save an item to localStorage with prefix
 * @param {string} key - Storage key 
 * @param {any} value - Value to store (will be JSON stringified)
 */
export function saveToStorage(key, value) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const serialized = JSON.stringify(value);
    localStorage.setItem(prefixedKey, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get an item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or defaultValue
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    const serialized = localStorage.getItem(prefixedKey);
    
    if (serialized === null) {
      return defaultValue;
    }
    
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key to remove
 */
export function removeFromStorage(key) {
  try {
    const prefixedKey = STORAGE_PREFIX + key;
    localStorage.removeItem(prefixedKey);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Clear all app-specific items from localStorage
 */
export function clearStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Save user preferences
 * @param {Object} preferences - User preference object
 */
export function saveUserPreferences(preferences) {
  saveToStorage('user_preferences', preferences);
}

/**
 * Get user preferences
 * @returns {Object} User preferences
 */
export function getUserPreferences() {
  return getFromStorage('user_preferences', {
    defaultAsset: 'BTC/USD',
    defaultTimeframe: '1d',
    watchlist: ['BTC/USD', 'ETH/USD', 'US100', 'AAPL', 'GOLD'],
    notifications: true,
    chartType: 'candle'
  });
}

/**
 * Save watchlist to localStorage
 * @param {Array} watchlist - Array of asset symbols
 */
export function saveWatchlist(watchlist) {
  saveToStorage('watchlist', watchlist);
}

/**
 * Get watchlist from localStorage
 * @returns {Array} Watchlist array
 */
export function getWatchlist() {
  return getFromStorage('watchlist', ['BTC/USD', 'ETH/USD', 'US100', 'AAPL', 'GOLD']);
}

/**
 * Add asset to watchlist
 * @param {string} symbol - Asset symbol to add
 * @returns {boolean} True if added, false if already exists
 */
export function addToWatchlist(symbol) {
  const watchlist = getWatchlist();
  if (watchlist.includes(symbol)) {
    return false;
  }
  
  watchlist.push(symbol);
  saveWatchlist(watchlist);
  return true;
}

/**
 * Remove asset from watchlist
 * @param {string} symbol - Asset symbol to remove
 * @returns {boolean} True if removed, false if not found
 */
export function removeFromWatchlist(symbol) {
  const watchlist = getWatchlist();
  const initialLength = watchlist.length;
  
  const filtered = watchlist.filter(item => item !== symbol);
  saveWatchlist(filtered);
  
  return filtered.length < initialLength;
}