import { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const AnalysisCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

const IndicatorValue = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AssetAnalysis = ({ asset, timeframe }) => {
  const [analysis, setAnalysis] = useState({
    technical: {
      rsi: 0,
      macd: { value: 0, signal: 0, histogram: 0 },
      ema: { ema20: 0, ema50: 0, ema200: 0 },
    },
    ml: {
      prediction: '',
      confidence: 0,
      takeProfit: { level1: 0, level2: 0, level3: 0 },
      stopLoss: 0,
    },
  });

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/analysis/${asset}?timeframe=${timeframe}`);
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    };

    fetchAnalysis();
  }, [asset, timeframe]);

  return (
    <AnalysisCard>
      <Typography variant="h6" gutterBottom>
        Technical Analysis
      </Typography>

      <Grid container spacing={2}>
        {/* Technical Indicators */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              RSI (14)
            </Typography>
            <IndicatorValue>
              <LinearProgress
                variant="determinate"
                value={analysis.technical.rsi}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: analysis.technical.rsi > 70 ? '#ef5350' : 
                                   analysis.technical.rsi < 30 ? '#26a69a' : '#2196f3',
                  },
                }}
              />
              <Typography variant="body2">
                {analysis.technical.rsi.toFixed(2)}
              </Typography>
            </IndicatorValue>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              MACD
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Value
                </Typography>
                <Typography variant="body2">
                  {analysis.technical.macd.value.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Signal
                </Typography>
                <Typography variant="body2">
                  {analysis.technical.macd.signal.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Histogram
                </Typography>
                <Typography variant="body2">
                  {analysis.technical.macd.histogram.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* ML Predictions */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              ML Prediction
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={analysis.ml.prediction}
                color={analysis.ml.prediction === 'BUY' ? 'success' : 'error'}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Confidence: {(analysis.ml.confidence * 100).toFixed(1)}%
              </Typography>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Take Profit Levels
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Level 1
                </Typography>
                <Typography variant="body2">
                  {analysis.ml.takeProfit.level1.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Level 2
                </Typography>
                <Typography variant="body2">
                  {analysis.ml.takeProfit.level2.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Level 3
                </Typography>
                <Typography variant="body2">
                  {analysis.ml.takeProfit.level3.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stop Loss
              </Typography>
              <Typography variant="body2">
                {analysis.ml.stopLoss.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </AnalysisCard>
  );
};

export default AssetAnalysis; 