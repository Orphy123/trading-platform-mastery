import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startMirage } from './mirage';
import './index.css'

// Initialize Mirage server in development
if (process.env.NODE_ENV === 'development') {
  startMirage();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
