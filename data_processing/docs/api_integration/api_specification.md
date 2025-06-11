# Trading Assistant API Specification

## Overview
This document outlines the API endpoints and data formats for integrating the data processing backend with the frontend of the Trading Assistant platform.

## Base URL
```
http://api.trading-assistant.com/v1/
```

## API Endpoints

### 1. Market Data

#### 1.1 Get Current Price
Returns the latest price data for a specified asset.

```
GET /market/price/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset (e.g., "EUR/USD", "US100")

**Response:**
```json
{
  "symbol": "EUR/USD",
  "timestamp": 1655471400000,
  "price": 1.0892,
  "open": 1.0887,
  "high": 1.0898,
  "low": 1.0885,
  "change": 0.0005,
  "change_percent": 0.046,
  "updated_at": "2023-06-17T15:30:00Z"
}
```

#### 1.2 Get Historical Data
Returns historical price data for a specified asset and timeframe.

```
GET /market/history/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset
- `interval` (optional): Data interval ("1m", "5m", "15m", "30m", "1h", "4h", "1d"). Default: "1h"
- `from` (optional): Start date (YYYY-MM-DD) or timestamp
- `to` (optional): End date (YYYY-MM-DD) or timestamp
- `limit` (optional): Number of data points. Default: 100, Max: 1000

**Response:**
```json
{
  "symbol": "EUR/USD",
  "interval": "1h",
  "data": [
    {
      "timestamp": 1655471400000,
      "datetime": "2023-06-17T15:30:00Z",
      "open": 1.0887,
      "high": 1.0898,
      "low": 1.0885,
      "close": 1.0892,
      "volume": 5432
    },
    {
      "timestamp": 1655475000000,
      "datetime": "2023-06-17T16:30:00Z",
      "open": 1.0892,
      "high": 1.0901,
      "low": 1.0888,
      "close": 1.0898,
      "volume": 4827
    }
    // ... additional data points
  ]
}
```

### 2. News Sentiment

#### 2.1 Get Latest Sentiment
Returns the latest sentiment analysis for a specified asset.

```
GET /sentiment/latest/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset

**Response:**
```json
{
  "symbol": "US100",
  "timestamp": 1655471400000,
  "datetime": "2023-06-17T15:30:00Z",
  "sentiment_score": 0.65,
  "sentiment_magnitude": 0.78,
  "sentiment_label": "positive",
  "positive_ratio": 0.72,
  "negative_ratio": 0.18,
  "neutral_ratio": 0.10,
  "article_count": 15,
  "key_phrases": ["economic growth", "tech rally", "positive outlook"],
  "updated_at": "2023-06-17T15:45:32Z"
}
```

#### 2.2 Get Historical Sentiment
Returns historical sentiment data for a specified asset.

```
GET /sentiment/history/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset
- `days` (optional): Number of days of history to return. Default: 7, Max: 30

**Response:**
```json
{
  "symbol": "US100",
  "data": [
    {
      "date": "2023-06-17",
      "sentiment_score": 0.65,
      "sentiment_magnitude": 0.78,
      "sentiment_label": "positive",
      "positive_ratio": 0.72,
      "negative_ratio": 0.18,
      "neutral_ratio": 0.10,
      "article_count": 15
    },
    {
      "date": "2023-06-16",
      "sentiment_score": 0.42,
      "sentiment_magnitude": 0.56,
      "sentiment_label": "neutral",
      "positive_ratio": 0.48,
      "negative_ratio": 0.22,
      "neutral_ratio": 0.30,
      "article_count": 12
    }
    // ... additional data points
  ]
}
```

### 3. Trading Signals

#### 3.1 Get Latest Signal
Returns the latest trading signal for a specified asset.

```
GET /signals/latest/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset

**Response:**
```json
{
  "symbol": "EUR/USD",
  "timestamp": 1655471400000,
  "datetime": "2023-06-17T15:30:00Z",
  "signal": "BUY",  // "BUY", "SELL", or "HOLD"
  "signal_strength": 0.85,  // Confidence value between 0-1
  "price": 1.0892,
  "factors": {
    "technical": 0.75,  // Technical analysis contribution
    "sentiment": 0.25   // Sentiment analysis contribution
  },
  "timeframe": "medium",  // "short", "medium", or "long"
  "updated_at": "2023-06-17T15:45:00Z"
}
```

#### 3.2 Get Signal History
Returns historical trading signals for a specified asset.

```
GET /signals/history/{asset_symbol}
```

**Parameters:**
- `asset_symbol` (required): Symbol of the asset
- `limit` (optional): Number of signals to return. Default: 10, Max: 100

**Response:**
```json
{
  "symbol": "EUR/USD",
  "signals": [
    {
      "timestamp": 1655471400000,
      "datetime": "2023-06-17T15:30:00Z",
      "signal": "BUY",
      "signal_strength": 0.85,
      "price": 1.0892
    },
    {
      "timestamp": 1655385000000,
      "datetime": "2023-06-16T15:30:00Z",
      "signal": "HOLD",
      "signal_strength": 0.55,
      "price": 1.0887
    }
    // ... additional signals
  ]
}
```

### 4. Dashboard Data

#### 4.1 Get Asset Summary
Returns a summary of current data for all or selected assets.

```
GET /dashboard/summary
```

**Parameters:**
- `assets` (optional): Comma-separated list of asset symbols. If not provided, returns data for all supported assets.

**Response:**
```json
{
  "timestamp": 1655471400000,
  "datetime": "2023-06-17T15:30:00Z",
  "assets": [
    {
      "symbol": "EUR/USD",
      "price": 1.0892,
      "change_percent": 0.046,
      "sentiment_score": 0.32,
      "sentiment_label": "neutral",
      "signal": "BUY",
      "signal_strength": 0.85
    },
    {
      "symbol": "US100",
      "price": 14532.45,
      "change_percent": 1.25,
      "sentiment_score": 0.65,
      "sentiment_label": "positive",
      "signal": "BUY",
      "signal_strength": 0.92
    },
    {
      "symbol": "US30",
      "price": 33876.78,
      "change_percent": 0.89,
      "sentiment_score": 0.58,
      "sentiment_label": "positive",
      "signal": "HOLD",
      "signal_strength": 0.63
    },
    {
      "symbol": "GBP/USD",
      "price": 1.2743,
      "change_percent": -0.12,
      "sentiment_score": 0.18,
      "sentiment_label": "negative",
      "signal": "SELL",
      "signal_strength": 0.71
    },
    {
      "symbol": "CRUDE OIL",
      "price": 72.45,
      "change_percent": 2.34,
      "sentiment_score": 0.72,
      "sentiment_label": "positive",
      "signal": "BUY",
      "signal_strength": 0.88
    }
  ]
}
```

## Error Responses

All endpoints return standard HTTP error codes with a JSON response body:

```json
{
  "error": true,
  "code": 404,
  "message": "Asset not found",
  "details": "The requested asset 'XYZ' is not supported."
}
```

## Rate Limits

- 60 requests per minute per IP for market data endpoints
- 30 requests per minute per IP for sentiment and signal endpoints

## Authentication

All API requests require an API key passed in the header:

```
X-API-Key: your_api_key_here
```

## Websocket API

For real-time updates, connect to our WebSocket endpoint:

```
wss://api.trading-assistant.com/v1/ws
```

### Subscription Topics

- `price:{asset_symbol}` - Real-time price updates
- `sentiment:{asset_symbol}` - Real-time sentiment updates
- `signal:{asset_symbol}` - Real-time signal updates

### Example WebSocket Message

```json
{
  "type": "price_update",
  "symbol": "EUR/USD",
  "data": {
    "price": 1.0895,
    "timestamp": 1655472300000,
    "change_percent": 0.028
  }
}
```