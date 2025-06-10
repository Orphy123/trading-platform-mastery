// src/utils/calculation.js

/**
 * Financial calculation utilities for the Trading Assistant Platform
 */

/**
 * Calculate the percentage change between two values
 * @param {number} currentValue - Current value
 * @param {number} previousValue - Previous value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return 0;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation
 * @param {string} key - Object key to use for calculation (optional)
 * @returns {Array} Array of SMA values
 */
export function calculateSMA(data, period, key = null) {
  const result = [];
  
  // If data array is too small, return empty array
  if (data.length < period) {
    return result;
  }
  
  // Initialize sum for the first window
  let sum = 0;
  for (let i = 0; i < period; i++) {
    const value = key !== null ? data[i][key] : data[i];
    sum += value;
  }
  
  // Calculate SMA for each window
  for (let i = period; i <= data.length; i++) {
    const sma = sum / period;
    result.push(sma);
    
    // Update sum for next window by removing oldest value and adding newest
    if (i < data.length) {
      const oldestValue = key !== null ? data[i - period][key] : data[i - period];
      const newestValue = key !== null ? data[i][key] : data[i];
      sum = sum - oldestValue + newestValue;
    }
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation
 * @param {string} key - Object key to use for calculation (optional)
 * @returns {Array} Array of EMA values
 */
export function calculateEMA(data, period, key = null) {
  const result = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Calculate SMA for the first data point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    const value = key !== null ? data[i][key] : data[i];
    sum += value;
  }
  
  // First EMA is just the SMA
  let ema = sum / period;
  result.push(ema);
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA for rest of the data
  for (let i = period; i < data.length; i++) {
    const currentValue = key !== null ? data[i][key] : data[i];
    ema = (currentValue - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation (usually 14)
 * @param {string} key - Object key to use for calculation (optional)
 * @returns {Array} Array of RSI values
 */
export function calculateRSI(data, period = 14, key = null) {
  const result = [];
  
  if (data.length < period + 1) {
    return result;
  }
  
  // Calculate price changes
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    const currentValue = key !== null ? data[i][key] : data[i];
    const prevValue = key !== null ? data[i-1][key] : data[i-1];
    changes.push(currentValue - prevValue);
  }
  
  // Calculate average gains and losses over the specified period
  let avgGain = 0;
  let avgLoss = 0;
  
  // First period
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate first RSI
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  let rsi = 100 - (100 / (1 + rs));
  result.push(rsi);
  
  // Calculate remaining RSI values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    rsi = 100 - (100 / (1 + rs));
    result.push(rsi);
  }
  
  return result;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param {Array} data - Array of price data
 * @param {number} fastPeriod - Fast period (usually 12)
 * @param {number} slowPeriod - Slow period (usually 26)
 * @param {number} signalPeriod - Signal period (usually 9)
 * @param {string} key - Object key to use for calculation (optional)
 * @returns {Object} Object with MACD line, signal line, and histogram
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, key = null) {
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod, key);
  const slowEMA = calculateEMA(data, slowPeriod, key);
  
  // MACD line is the difference between fast and slow EMAs
  const macdLine = [];
  const startDiff = slowPeriod - fastPeriod;
  
  // Align the EMA arrays since slow EMA has fewer values
  for (let i = 0; i < fastEMA.length - startDiff; i++) {
    macdLine.push(fastEMA[i + startDiff] - slowEMA[i]);
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram (MACD line - Signal line)
  const histogram = [];
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
  }
  
  return {
    macdLine,
    signalLine,
    histogram
  };
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of price data
 * @param {number} period - Period for calculation (usually 20)
 * @param {number} multiplier - Standard deviation multiplier (usually 2)
 * @param {string} key - Object key to use for calculation (optional)
 * @returns {Object} Object with middle band, upper band, and lower band
 */
export function calculateBollingerBands(data, period = 20, multiplier = 2, key = null) {
  const middleBand = calculateSMA(data, period, key);
  const upperBand = [];
  const lowerBand = [];
  
  for (let i = period - 1; i < data.length; i++) {
    // Calculate standard deviation for the current window
    let sum = 0;
    for (let j = i - (period - 1); j <= i; j++) {
      const value = key !== null ? data[j][key] : data[j];
      sum += Math.pow(value - middleBand[i - (period - 1)], 2);
    }
    const standardDeviation = Math.sqrt(sum / period);
    
    // Calculate upper and lower bands
    upperBand.push(middleBand[i - (period - 1)] + (multiplier * standardDeviation));
    lowerBand.push(middleBand[i - (period - 1)] - (multiplier * standardDeviation));
  }
  
  return {
    middleBand,
    upperBand,
    lowerBand
  };
}

/**
 * Calculate risk-adjusted returns (Sharpe ratio)
 * @param {Array} returns - Array of percentage returns
 * @param {number} riskFreeRate - Risk-free rate as decimal (e.g., 0.02 for 2%)
 * @returns {number} Sharpe ratio
 */
export function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
  if (returns.length === 0) return 0;
  
  // Calculate average return
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  // Calculate standard deviation of returns
  const sumSquaredDiff = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - avgReturn, 2);
  }, 0);
  const stdDev = Math.sqrt(sumSquaredDiff / returns.length);
  
  // Avoid division by zero
  if (stdDev === 0) return 0;
  
  // Calculate and return Sharpe ratio
  return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * Calculate portfolio allocation percentages
 * @param {Array} positions - Array of position objects with value property
 * @returns {Array} Positions with allocation percentage added
 */
export function calculatePortfolioAllocation(positions) {
  const totalValue = positions.reduce((sum, position) => sum + position.value, 0);
  
  return positions.map(position => {
    return {
      ...position,
      allocation: totalValue > 0 ? (position.value / totalValue) * 100 : 0
    };
  });
}

/**
 * Calculate profit/loss
 * @param {number} entryPrice - Entry price
 * @param {number} currentPrice - Current price
 * @param {number} quantity - Quantity
 * @param {boolean} isLong - Whether position is long (true) or short (false)
 * @returns {Object} Profit/loss amount and percentage
 */
export function calculateProfitLoss(entryPrice, currentPrice, quantity, isLong = true) {
  const profitLossAmount = isLong
    ? (currentPrice - entryPrice) * quantity
    : (entryPrice - currentPrice) * quantity;
    
  const profitLossPercent = isLong
    ? ((currentPrice - entryPrice) / entryPrice) * 100
    : ((entryPrice - currentPrice) / entryPrice) * 100;
    
  return {
    amount: profitLossAmount,
    percentage: profitLossPercent
  };
}