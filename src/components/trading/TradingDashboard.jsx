import { useState, useEffect } from 'react';
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
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({
    currentPrice: 0,
    change: 0,
    high: 0,
    low: 0,
    volume: 0,
  });

  useEffect(() => {
    // Initialize chart
    const chart = createChart(document.getElementById('price-chart'), {
      width: document.getElementById('price-chart').clientWidth,
      height: 400,
      layout: {
        background: { color: '#0a1929' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e2d3d' },
        horzLines: { color: '#1e2d3d' },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Fetch and update chart data
    const fetchChartData = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/market-data/${selectedAsset}?timeframe=${timeframe}`);
        const data = await response.json();
        setChartData(data.candles);
        candlestickSeries.setData(data.candles);
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [selectedAsset, timeframe]);

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
        <ChartContainer id="price-chart" />
      </Paper>
    </Box>
  );
};

export default TradingDashboard; 