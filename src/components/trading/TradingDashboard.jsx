import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TradingDashboard = ({ selectedAsset, timeframe }) => {
  const [priceData, setPriceData] = useState(null);
  const [tradingSignal, setTradingSignal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulated API response
        const mockData = {
          prices: Array.from({ length: 100 }, (_, i) => ({
            time: new Date(Date.now() - (100 - i) * 60000).toISOString(),
            price: 100 + Math.random() * 10
          })),
          signal: {
            action: Math.random() > 0.5 ? 'BUY' : 'SELL',
            confidence: Math.random() * 100,
            timestamp: new Date().toISOString()
          }
        };

        setPriceData(mockData.prices);
        setTradingSignal(mockData.signal);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedAsset, timeframe]);

  const chartData = {
    labels: priceData?.map(d => new Date(d.time).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'Price',
        data: priceData?.map(d => d.price) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedAsset} Price Chart (${timeframe})`
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Signal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  icon={tradingSignal?.action === 'BUY' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={tradingSignal?.action}
                  color={tradingSignal?.action === 'BUY' ? 'success' : 'error'}
                  sx={{ color: 'white' }}
                />
                <Typography variant="body1">
                  Confidence: {tradingSignal?.confidence.toFixed(2)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Last updated: {new Date(tradingSignal?.timestamp).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  sx={{ flex: 1 }}
                >
                  Buy
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  sx={{ flex: 1 }}
                >
                  Sell
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradingDashboard; 