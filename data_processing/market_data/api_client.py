
import requests
from datetime import datetime
import pandas as pd
import os
import json
import time

class MarketDataClient:
    def __init__(self, api_provider='twelvedata', api_key=None):
        """
        Initialize the market data client with the chosen API provider
        
        Args:
            api_provider (str): The API provider to use ('twelvedata', 'finnhub', or 'alphavantage')
            api_key (str): API key for the chosen provider
        """
        self.api_provider = api_provider.lower()
        self.api_key = api_key
        
        # Base URLs for each provider
        self.base_urls = {
            'twelvedata': 'https://api.twelvedata.com',
            'finnhub': 'https://finnhub.io/api/v1',
            'alphavantage': 'https://www.alphavantage.co/query'
        }
        
        # Symbol mapping for different providers
        self.symbol_mapping = {
            'US100': {
                'twelvedata': 'NDX',
                'finnhub': '^NDX',
                'alphavantage': 'NDX'
            },
            'US30': {
                'twelvedata': 'DJI',
                'finnhub': '^DJI',
                'alphavantage': 'DJI'
            },
            'EUR/USD': {
                'twelvedata': 'EUR/USD',
                'finnhub': 'EURUSD',
                'alphavantage': 'EUR/USD'
            },
            'GBP/USD': {
                'twelvedata': 'GBP/USD',
                'finnhub': 'GBPUSD',
                'alphavantage': 'GBP/USD'
            },
            'Crude Oil WTI': {
                'twelvedata': 'WTI',
                'finnhub': 'CL',
                'alphavantage': 'USO'  # Using ETF as proxy
            },
            'Crude Oil Brent': {
                'twelvedata': 'BRENT',
                'finnhub': 'BZ',
                'alphavantage': 'BNO'  # Using ETF as proxy
            }
        }
    
    def get_current_price(self, asset):
        """Get the current price of an asset
        
        Args:
            asset (str): Asset symbol from our standardized list
            
        Returns:
            dict: Current price data
        """
        if self.api_provider not in self.base_urls:
            raise ValueError(f"Unsupported API provider: {self.api_provider}")
            
        symbol = self.symbol_mapping.get(asset, {}).get(self.api_provider)
        if not symbol:
            raise ValueError(f"Asset {asset} not supported for {self.api_provider}")
            
        if self.api_provider == 'twelvedata':
            url = f"{self.base_urls['twelvedata']}/price"
            params = {
                'symbol': symbol,
                'apikey': self.api_key
            }
            response = requests.get(url, params=params)
            return response.json()
            
        elif self.api_provider == 'finnhub':
            url = f"{self.base_urls['finnhub']}/quote"
            params = {
                'symbol': symbol,
                'token': self.api_key
            }
            response = requests.get(url, params=params)
            return response.json()
            
        elif self.api_provider == 'alphavantage':
            is_forex = '/' in asset
            
            if is_forex:
                url = self.base_urls['alphavantage']
                from_currency, to_currency = symbol.split('/')
                params = {
                    'function': 'CURRENCY_EXCHANGE_RATE',
                    'from_currency': from_currency,
                    'to_currency': to_currency,
                    'apikey': self.api_key
                }
            else:
                url = self.base_urls['alphavantage']
                params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': symbol,
                    'apikey': self.api_key
                }
                
            response = requests.get(url, params=params)
            return response.json()
            
    def get_historical_data(self, asset, interval='1h', count=100):
        """Get historical OHLCV data
        
        Args:
            asset (str): Asset symbol from our standardized list
            interval (str): Time interval (1m, 5m, 15m, 1h, 4h, 1d)
            count (int): Number of candles to return
            
        Returns:
            pandas.DataFrame: Historical price data
        """
        # Implementation would vary based on provider
        # This is a placeholder for the actual implementation
        pass
        
    def format_response(self, raw_response, asset, data_type='price'):
        """
        Standardize the API response format for frontend consumption
        
        Args:
            raw_response (dict): API response from the provider
            asset (str): Asset symbol
            data_type (str): Type of data ('price' or 'historical')
            
        Returns:
            dict: Standardized response
        """
        # Implementation would standardize responses across different providers
        # This is a placeholder for the actual implementation
        pass
