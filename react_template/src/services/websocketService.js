// src/services/websocketService.js
import { WS_URL, USE_MOCK_DATA } from './apiConfig';

/**
 * WebSocket connection for real-time data updates
 * In mock mode, it simulates WebSocket behavior with periodic updates
 */
class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second delay
    this.mockUpdateInterval = null;
  }

  /**
   * Connect to the WebSocket server
   * @param {string[]} symbols - Array of asset symbols to subscribe to
   * @returns {Promise<boolean>} Connection success
   */
  connect(symbols) {
    if (USE_MOCK_DATA) {
      console.log('Using mock WebSocket data');
      this.startMockUpdates(symbols);
      return true;
    }

    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }

      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Subscribe to symbols
        symbols.forEach(symbol => {
          this.subscribe(symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(symbols);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fall back to mock data on error
        if (!USE_MOCK_DATA) {
          console.log('Falling back to mock data due to WebSocket error');
          this.startMockUpdates(symbols);
        }
      };

      return true;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      // Fall back to mock data on error
      if (!USE_MOCK_DATA) {
        console.log('Falling back to mock data due to connection error');
        this.startMockUpdates(symbols);
      }
      return false;
    }
  }

  /**
   * Handle WebSocket reconnection with exponential backoff
   */
  handleReconnect(symbols) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(symbols);
      }, this.reconnectDelay);
      
      // Exponential backoff
      this.reconnectDelay *= 2;
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to updates for specific assets
   * @param {string} symbol - Asset symbol to subscribe to
   */
  subscribe(symbol) {
    if (USE_MOCK_DATA) return;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol
      }));
    }
  }

  /**
   * Unsubscribe from updates for specific assets
   * @param {string} symbol - Asset symbol to unsubscribe from
   */
  unsubscribe(symbol) {
    if (USE_MOCK_DATA) return;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol
      }));
    }
  }

  /**
   * Add event listener for specified event type
   * @param {string} eventType - Type of event to listen for
   * @param {function} callback - Callback function for event
   */
  addEventListener(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).add(callback);
      return true;
    }
    return false;
  }

  /**
   * Remove event listener
   * @param {string} eventType - Type of event
   * @param {function} callback - Callback function to remove
   */
  removeEventListener(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(callback);
      return true;
    }
    return false;
  }

  /**
   * Notify all listeners of an event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   */
  notifySubscribers(data) {
    const { symbol } = data;
    if (this.subscribers.has(symbol)) {
      this.subscribers.get(symbol).forEach(callback => {
        callback(data);
      });
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }

  startMockUpdates(symbols) {
    // Clear any existing mock update intervals
    if (this.mockUpdateInterval) {
      clearInterval(this.mockUpdateInterval);
    }

    // Generate mock updates every 2 seconds
    this.mockUpdateInterval = setInterval(() => {
      symbols.forEach(symbol => {
        const mockData = this.generateMockUpdate(symbol);
        this.notifySubscribers(mockData);
      });
    }, 2000);
  }

  generateMockUpdate(symbol) {
    const basePrice = 100 + Math.random() * 900; // Random base price between 100 and 1000
    const change = (Math.random() - 0.5) * 10; // Random change between -5 and 5
    const price = basePrice + change;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      type: 'price_update',
      data: {
        price,
        change,
        change_percent: changePercent,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export default new WebSocketService();