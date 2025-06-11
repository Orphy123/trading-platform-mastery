// src/components/common/SentimentBadge.jsx
import React from 'react';

/**
 * A component to display sentiment analysis with score and label
 * @param {Object} props Component props
 * @param {number} props.score Sentiment score (-1 to 1)
 * @param {string} props.label Sentiment label (Positive, Negative, Neutral)
 * @param {string} props.size Size of badge (sm, md, lg)
 * @returns {JSX.Element} SentimentBadge component
 */
function SentimentBadge({ score, label, size = 'md' }) {
  // Default to neutral if no score/label provided
  const sentimentScore = score !== undefined && score !== null ? score : 0;
  const sentimentLabel = label || (sentimentScore > 0.2 ? 'Positive' : 
                                  sentimentScore < -0.2 ? 'Negative' : 'Neutral');
  
  // Determine colors based on sentiment
  const getGaugeColor = (score) => {
    if (score > 0.2) return '#22c55e'; // green-500
    if (score < -0.2) return '#ef4444'; // red-500
    return '#f59e0b'; // amber-500
  };
  
  const getBgClass = (label) => {
    if (typeof label !== 'string') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    
    switch (label.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: // neutral or other
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };
  
  // Determine size for the gauge
  let gaugeSize = 80;
  let textSize = 'text-xs';
  let labelSize = 'text-sm';
  
  switch (size) {
    case 'sm':
      gaugeSize = 60;
      textSize = 'text-xxs';
      labelSize = 'text-xs';
      break;
    case 'lg':
      gaugeSize = 120;
      textSize = 'text-sm';
      labelSize = 'text-lg';
      break;
    case 'md':
    default:
      // Default values set above
      break;
  }
  
  // Calculate paths for the semicircular gauge
  const calculatePath = (score) => {
    // Normalize score to 0-1 range for the semi-circle
    const normalizedScore = (score + 1) / 2;
    
    const cx = gaugeSize / 2;
    const cy = gaugeSize / 2;
    const radius = (gaugeSize / 2) * 0.8;
    
    // Calculate end angle (0 is at 3 o'clock, we want to go from 180 to 0 degrees)
    // 180 degrees is the lowest sentiment, 0 is the highest
    const startAngle = Math.PI; // 180 degrees
    const endAngle = Math.PI * (1 - normalizedScore);
    
    // Calculate start and end points
    const startX = cx - radius * Math.cos(startAngle);
    const startY = cy - radius * Math.sin(startAngle);
    const endX = cx - radius * Math.cos(endAngle);
    const endY = cy - radius * Math.sin(endAngle);
    
    // Determine the large arc flag (1 for > 180 degrees)
    const largeArcFlag = normalizedScore > 0.5 ? 1 : 0;
    
    // Create the SVG path
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Sentiment gauge */}
      <div className="relative" style={{ width: gaugeSize, height: gaugeSize / 2 }}>
        <svg width={gaugeSize} height={gaugeSize / 2} className="overflow-visible">
          {/* Background arc (gray) */}
          <path
            d={`M ${gaugeSize * 0.1} ${gaugeSize / 2} A ${gaugeSize * 0.4} ${gaugeSize * 0.4} 0 0 1 ${gaugeSize * 0.9} ${gaugeSize / 2}`}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="4"
            className="dark:stroke-gray-700"
          />
          
          {/* Sentiment arc (colored based on sentiment) */}
          <path
            d={calculatePath(sentimentScore)}
            fill="none"
            stroke={getGaugeColor(sentimentScore)}
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Indicator needle */}
          <line
            x1={gaugeSize / 2}
            y1={gaugeSize / 2}
            x2={gaugeSize / 2 + Math.cos(Math.PI * (1 - (sentimentScore + 1) / 2)) * gaugeSize * 0.35}
            y2={gaugeSize / 2 - Math.sin(Math.PI * (1 - (sentimentScore + 1) / 2)) * gaugeSize * 0.35}
            stroke={getGaugeColor(sentimentScore)}
            strokeWidth="2"
          />
          
          {/* Center circle */}
          <circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r="4"
            fill={getGaugeColor(sentimentScore)}
          />
          
          {/* Min/Max/Neutral labels */}
          <text
            x={gaugeSize * 0.1}
            y={gaugeSize * 0.3}
            className={`${textSize} fill-gray-500 dark:fill-gray-400`}
            textAnchor="middle"
          >
            -1
          </text>
          <text
            x={gaugeSize * 0.5}
            y={gaugeSize * 0.2}
            className={`${textSize} fill-gray-500 dark:fill-gray-400`}
            textAnchor="middle"
          >
            0
          </text>
          <text
            x={gaugeSize * 0.9}
            y={gaugeSize * 0.3}
            className={`${textSize} fill-gray-500 dark:fill-gray-400`}
            textAnchor="middle"
          >
            1
          </text>
        </svg>
      </div>
      
      {/* Sentiment score and label */}
      <div className="mt-2 text-center">
        <div className={`font-bold ${labelSize} ${getBgClass(sentimentLabel)} inline-block px-3 py-1 rounded-full`}>
          {sentimentLabel}
        </div>
        <div className={`${textSize} text-gray-500 dark:text-gray-400 mt-1`}>
          Score: {sentimentScore.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default SentimentBadge;