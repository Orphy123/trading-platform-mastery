// src/utils/format.js

/**
 * Utility functions for formatting data in the Trading Assistant Platform
 */

/**
 * Format a number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number as percentage
 * @param {number} value - Number to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number with specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 2) {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a date/time string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style (short, medium, long, relative)
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDateTime(date, format = 'medium', locale = 'en-US') {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  // For relative time formatting ("5 mins ago", "2 hours ago", etc.)
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  }
  
  const options = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }
  };
  
  return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(dateObj);
}

/**
 * Format a signal strength value
 * @param {number} strength - Signal strength (0-1)
 * @returns {string} Formatted signal strength
 */
export function formatSignalStrength(strength) {
  if (strength === undefined || strength === null) return 'N/A';
  
  const percentage = Math.round(strength * 100);
  return `${percentage}% Confidence`;
}

/**
 * Format a large number with appropriate suffix (K, M, B)
 * @param {number} value - Number to format
 * @returns {string} Formatted number with suffix
 */
export function formatLargeNumber(value) {
  if (value === undefined || value === null) return 'N/A';
  
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (absValue >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (absValue >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms) {
  if (ms === undefined || ms === null) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format large numbers with K/M/B suffixes
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number
 */
export function formatCompactNumber(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  if (Math.abs(value) < 1000) {
    return value.toFixed(decimals);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
  
  const shortValue = value / Math.pow(10, suffixIndex * 3);
  return shortValue.toFixed(decimals) + suffixes[suffixIndex];
}

/**
 * Format a percentage change with color indication
 * @param {number} value - Percentage change value
 * @param {boolean} includeSign - Whether to include +/- sign
 * @param {number} decimals - Number of decimal places
 * @returns {Object} Object with formatted value and color class
 */
export function formatChangePercent(value, includeSign = true, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: 'N/A', colorClass: 'text-gray-500' };
  }
  
  let formatted = value.toFixed(decimals) + '%';
  if (includeSign && value > 0) formatted = '+' + formatted;
  
  let colorClass = 'text-gray-500';
  if (value > 0) colorClass = 'text-green-500';
  if (value < 0) colorClass = 'text-red-500';
  
  return { value: formatted, colorClass };
}

export function formatDate(date, options = {}, locale = 'en-US') {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  // If options is a string, use some predefined formats
  if (typeof options === 'string') {
    switch(options) {
      case 'short':
        return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(dateObj);
      case 'medium':
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(dateObj);
      case 'long':
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj);
      default:
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric' }).format(dateObj);
    }
  }
  
  // Otherwise, use options as Intl.DateTimeFormat options
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Generate a color based on a value (e.g., for price change)
 * @param {number} value - Value to determine color
 * @param {string} type - Color type: 'text', 'bg', 'border'
 * @returns {string} Tailwind CSS color class
 */
export function getValueColor(value, type = 'text') {
  if (value === null || value === undefined || isNaN(value)) {
    return `${type}-gray-500`;
  }
  
  const prefix = type === 'text' ? 'text' : type === 'bg' ? 'bg' : 'border';
  
  if (value > 0) {
    return `${prefix}-green-500`;
  } else if (value < 0) {
    return `${prefix}-red-500`;
  } else {
    return `${prefix}-gray-500`;
  }
}

/**
 * Format a price with appropriate decimal places based on value
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) {
    return 'N/A';
  }
  
  // For crypto assets like Bitcoin which can have fractional values
  if (price >= 1000) {
    return price.toFixed(2);
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    // For very low values (e.g., some crypto tokens)
    return price.toFixed(6);
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 30) {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
}