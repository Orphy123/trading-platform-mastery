import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Grid, Chip, CircularProgress } from '@mui/material';
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

const TradingDashboard = ({ selectedAsset, selectedTimeframe }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = React.useState([]);
  const [metrics, setMetrics] = React.useState({
    currentPrice: 0,
    change: 0,
    high: 0,
    low: 0,
    volume: 0,
  });

  useEffect(() => {
    if (!selectedAsset) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/market-data/${selectedAsset}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const { success, data } = await response.json();
        if (!success) {
          throw new Error('Failed to fetch chart data');
        }

        if (chartRef.current) {
          chartRef.current.remove();
        }

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

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        candlestickSeries.setData(data);
        chartRef.current = chart;

        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
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
        console.error('Error fetching chart data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedAsset, selectedTimeframe]);

  if (!selectedAsset) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please select an asset to view the chart
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {selectedAsset} Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {selectedTimeframe} Timeframe
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