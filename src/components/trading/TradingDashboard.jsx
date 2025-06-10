import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Grid, Chip } from '@mui/material';
import { createChart } from 'lightweight-charts';
import { styled } from '@mui/material/styles';

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  width: '100%',
  position: 'relative',
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const TradingDashboard = ({ selectedAsset, timeframe }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [chartData, setChartData] = React.useState([]);
  const [metrics, setMetrics] = React.useState({
    currentPrice: 0,
    change: 0,
    high: 0,
    low: 0,
    volume: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart instance
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#1e1e1e' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
      });

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Store references
      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Fetch chart data
      const fetchChartData = async () => {
        try {
          const response = await fetch(`/api/chart/${selectedAsset}?timeframe=${timeframe}`);
          const data = await response.json();
          if (data && data.data) {
            candlestickSeries.setData(data.data);
            setChartData(data.data);
            setMetrics(data.metrics);
          }
        } catch (err) {
          console.error('Error fetching chart data:', err);
          setError('Failed to load chart data');
        }
      };

      fetchChartData();

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (err) {
      console.error('Error initializing chart:', err);
      setError('Failed to initialize chart');
    }
  }, [selectedAsset, timeframe]);

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {selectedAsset} Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {timeframe} Timeframe
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="subtitle2" color="text.secondary">
              Current Price
            </Typography>
            <Typography variant="h6">
              {metrics.currentPrice.toFixed(2)}
            </Typography>
            <Chip
              label={`${metrics.change >= 0 ? '+' : ''}${metrics.change.toFixed(2)}%`}
              color={metrics.change >= 0 ? 'success' : 'error'}
              size="small"
            />
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="subtitle2" color="text.secondary">
              24h High
            </Typography>
            <Typography variant="h6">
              {metrics.high.toFixed(2)}
            </Typography>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="subtitle2" color="text.secondary">
              24h Low
            </Typography>
            <Typography variant="h6">
              {metrics.low.toFixed(2)}
            </Typography>
          </MetricCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="subtitle2" color="text.secondary">
              Volume
            </Typography>
            <Typography variant="h6">
              {metrics.volume.toLocaleString()}
            </Typography>
          </MetricCard>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <ChartContainer ref={chartContainerRef} />
      </Paper>
    </Box>
  );
};

export default TradingDashboard; 