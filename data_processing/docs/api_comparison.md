# Financial Data API Comparison

This document compares the main features of financial data APIs for our trading assistant platform.

## TwelveData

**Description**: Financial data provider with real-time and historical stock, forex, cryptocurrency, and index data

### Supported Assets
- **US100**: NASDAQ 100 (NDX)
- **US30**: Dow Jones Industrial Average (DJI)
- **EUR/USD**: EUR/USD forex pair
- **GBP/USD**: GBP/USD forex pair
- **Crude Oil**: WTI and Brent crude oil futures

### Key Endpoints
- **time_series**: /time_series - Get OHLCV data
- **quote**: /quote - Get latest price
- **price**: /price - Get real-time price
- **forex_pairs**: /forex_pairs - List available forex pairs
- **indices**: /indices - List available indices

### Pricing Tiers
- **free_tier**: 8 API calls/minute, limited endpoints
- **starter**: $12/month - 600 API calls/day
- **standard**: $29/month - 3000 API calls/day
- **premium**: $99/month - 15000 API calls/day

### Data Frequency
As low as 1 minute on paid plans

### Pros
- Comprehensive coverage of all our required assets
- Simple API structure
- WebSocket support for real-time data

### Cons
- Limited free tier
- Higher pricing for real-time data

---

## Finnhub

**Description**: Real-time RESTful APIs for stocks, forex, and crypto

### Supported Assets
- **US100**: Via index symbol ^NDX
- **US30**: Via index symbol ^DJI
- **EUR/USD**: Via forex endpoint
- **GBP/USD**: Via forex endpoint
- **Crude Oil**: Via commodity symbols CL and BZ

### Key Endpoints
- **quote**: /quote - Get real-time quote
- **forex/rates**: /forex/rates - Get forex rates
- **forex/candle**: /forex/candle - Get candlestick data
- **news**: /news - Get market news
- **indices/constituents**: /indices/constituents - Get index composition

### Pricing Tiers
- **free_tier**: 60 API calls/minute, basic data only
- **basic**: $15/month - 60 API calls/minute, more endpoints
- **standard**: $35/month - 120 API calls/minute, full access
- **premium**: $150/month - 600 API calls/minute, premium data

### Data Frequency
1 minute candles minimum

### Pros
- Good news sentiment API included
- Strong forex and crypto coverage
- WebSocket support

### Cons
- Index data sometimes delayed
- API structure more complex than TwelveData

---

## Alpha Vantage

**Description**: Provides free APIs for realtime and historical data on stocks, forex, and cryptocurrencies

### Supported Assets
- **US100**: Via index symbol NDX
- **US30**: Via index symbol DJI
- **EUR/USD**: Via forex endpoint EUR/USD
- **GBP/USD**: Via forex endpoint GBP/USD
- **Crude Oil**: Limited support through commodity ETFs like USO

### Key Endpoints
- **TIME_SERIES_INTRADAY**: Get intraday time series
- **GLOBAL_QUOTE**: Get current price and volume
- **FX_DAILY**: Get daily forex rates
- **FX_INTRADAY**: Get intraday forex data
- **NEWS_SENTIMENT**: Get news sentiment data

### Pricing Tiers
- **free_tier**: 5 API calls/minute, 500/day
- **premium**: $50/month - 120 API calls/minute, 5000 API calls/day
- **enterprise**: Custom pricing

### Data Frequency
As low as 1 minute, but with limitations on free tier

### Pros
- Generous free tier for prototyping
- Good documentation
- CSV format option

### Cons
- Rate limits can be restrictive
- Less comprehensive coverage for indices
- No WebSocket for real-time data

---

