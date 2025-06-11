// src/components/common/SignalBadge.jsx
import React from 'react';
import { formatSignalStrength } from '../../utils/format';

/**
 * A component to display trading signals with strength indicators
 * @param {Object} props Component props
 * @param {string} props.signal Signal type (BUY, SELL, HOLD)
 * @param {number} props.strength Signal strength (0-1)
 * @param {boolean} props.showStrength Whether to show strength label
 * @param {string} props.size Size of badge (sm, md, lg)
 * @returns {JSX.Element} SignalBadge component
 */
function SignalBadge({ signal, strength, showStrength = true, size = 'md' }) {
  if (!signal) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        NO SIGNAL
      </span>
    );
  }
  
  // Determine background and text color based on signal type
  let badgeClasses = '';
  switch (signal.toUpperCase()) {
    case 'BUY':
      badgeClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
    case 'SELL':
      badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      break;
    case 'HOLD':
      badgeClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      break;
    default:
      badgeClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
  
  // Determine size classes
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-1.5 py-0.5 text-xxs';
      break;
    case 'lg':
      sizeClasses = 'px-3 py-1 text-sm';
      break;
    case 'md':
    default:
      sizeClasses = 'px-2 py-1 text-xs';
  }
  
  return (
    <div className="inline-flex items-center">
      <span className={`font-medium rounded-full ${badgeClasses} ${sizeClasses}`}>
        {signal.toUpperCase()}
      </span>
      
      {showStrength && strength !== undefined && strength !== null && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {formatSignalStrength(strength)}
        </span>
      )}
    </div>
  );
}

export default SignalBadge;