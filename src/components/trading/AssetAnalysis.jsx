import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Chip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown, ShowChart } from '@mui/icons-material';

const AnalysisCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

const IndicatorValue = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AssetAnalysis = ({ selectedAsset, timeframe }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedAsset) return;
      
      try {
        setLoading(true);
        const encodedAsset = encodeURIComponent(selectedAsset);
        const response = await fetch(`/api/analysis/${encodedAsset}?timeframe=${timeframe}`);
        const data = await response.json();
        setAnalysis(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedAsset, timeframe]);

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!analysis) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography>Select an asset to view analysis</Typography>
      </Paper>
    );
  }

  const { technicalIndicators, mlPredictions } = analysis;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Technical Analysis
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Indicators
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">
              RSI
            </Typography>
            <Typography variant="h6" color={technicalIndicators.rsi > 70 ? 'error' : technicalIndicators.rsi < 30 ? 'success' : 'text.primary'}>
              {technicalIndicators.rsi.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="body2" color="text.secondary">
              MACD
            </Typography>
            <Typography variant="h6" color={technicalIndicators.macd.histogram > 0 ? 'success' : 'error'}>
              {technicalIndicators.macd.histogram.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          ML Predictions
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mlPredictions.trend === 'bullish' ? (
            <TrendingUp color="success" />
          ) : (
            <TrendingDown color="error" />
          )}
          <Typography variant="h6" color={mlPredictions.trend === 'bullish' ? 'success' : 'error'}>
            {mlPredictions.nextPrice.toFixed(4)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({mlPredictions.confidence.toFixed(2)} confidence)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AssetAnalysis; 