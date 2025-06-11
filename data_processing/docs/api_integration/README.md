# Frontend Integration Guide

## Overview
This document provides guidance for frontend engineers integrating with the Trading Assistant Platform's backend services. The integration covers market data retrieval, sentiment analysis, and trading signal generation.

## Data Files
This integration guide includes the following sample data files:

1. **API Specification**
   - `api_specification.md` - Complete API documentation with endpoints, parameters, and responses

2. **Sample Data Formats**
   - `sample_market_data.json` - Example market data responses for price and technical indicators
   - `sample_sentiment_data.json` - Example sentiment analysis data format
   - `sample_trading_signals.json` - Example trading signal output format

3. **UI Configuration**
   - `dashboard_ui_config.json` - Dashboard layout and configuration recommendations

## API Structure

The backend APIs are organized into the following categories:

### Market Data APIs
- `/market/price/{asset_symbol}` - Current price data for a specific asset
- `/market/history/{asset_symbol}` - Historical price data with various timeframes

### Sentiment Analysis APIs
- `/sentiment/latest/{asset_symbol}` - Latest sentiment analysis for an asset
- `/sentiment/history/{asset_symbol}` - Historical sentiment data

### Trading Signal APIs
- `/signals/latest/{asset_symbol}` - Latest trading signal recommendations
- `/signals/history/{asset_symbol}` - Historical signals

### Dashboard APIs
- `/dashboard/summary` - Combined market overview data for the dashboard

## Implementation Notes

### Authentication
All API requests require an API key in the header:
```
X-API-Key: your_api_key_here
```

### Real-time Updates
For real-time data, the frontend should use the WebSocket endpoint:
```
wss://api.trading-assistant.com/v1/ws
```

### Error Handling
All endpoints use standard HTTP status codes. Error responses include a consistent JSON format with error code, message, and details.

### Data Refresh Recommendations
- Price data: 60 seconds
- Sentiment data: 2 minutes
- Trading signals: 5 minutes

## Recommended UI Components

### Dashboard Components
1. **Market Overview Table**
   - Display all tracked assets with latest data
   - Color-coded price changes and signals

2. **Asset Detail Chart**
   - Interactive price chart with technical indicators
   - Toggle between timeframes
   - Overlay trading signals

3. **Sentiment Analysis Panel**
   - Visual sentiment gauge
   - Historical sentiment trend
   - Key topics from news analysis

4. **Trading Signal Dashboard**
   - Clear Buy/Hold/Sell recommendations
   - Signal strength indicators
   - Contributing factors breakdown

5. **News Feed**
   - Latest news articles
   - Sentiment highlighting
   - Filter by asset

## Data Processing Workflow

1. **Data Retrieval**
   - Market data is fetched from financial APIs
   - News is collected from financial news sources

2. **Sentiment Analysis**
   - News articles are processed for sentiment
   - Sentiment scores are aggregated by asset

3. **Signal Generation**
   - Technical indicators are calculated from price data
   - ML model combines technical and sentiment data
   - Buy/Sell/Hold signals are generated

4. **Data Integration**
   - Dashboard API combines all data sources
   - WebSocket provides real-time updates

## Integration Checklist

- [ ] Set up API authentication
- [ ] Implement market data retrieval
- [ ] Integrate sentiment visualization
- [ ] Display trading signals
- [ ] Configure real-time updates
- [ ] Implement error handling
- [ ] Test with sample data
