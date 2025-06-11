import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentDissatisfied as NegativeIcon,
  SentimentNeutral as NeutralIcon
} from '@mui/icons-material';

const NewsSentiment = ({ selectedAsset }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallSentiment, setOverallSentiment] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Simulated API response
        const mockNews = Array.from({ length: 5 }, (_, i) => ({
          id: i,
          title: `News headline ${i + 1} about ${selectedAsset}`,
          source: ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'WSJ'][i],
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: Math.random() * 100
        }));

        setNews(mockNews);
        setOverallSentiment({
          score: Math.random() * 100,
          direction: Math.random() > 0.5 ? 'positive' : 'negative'
        });
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedAsset]);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <PositiveIcon color="success" />;
      case 'negative':
        return <NegativeIcon color="error" />;
      default:
        return <NeutralIcon color="warning" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          News Sentiment Analysis
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Overall Sentiment
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getSentimentIcon(overallSentiment.direction)}
            <Typography variant="h4" component="div">
              {overallSentiment.score.toFixed(1)}%
            </Typography>
            <Chip
              icon={overallSentiment.direction === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={overallSentiment.direction.toUpperCase()}
              color={overallSentiment.direction === 'positive' ? 'success' : 'error'}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Latest News
        </Typography>
        <List>
          {news.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{item.source[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.title}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        size="small"
                        icon={getSentimentIcon(item.sentiment)}
                        label={`${item.sentiment} (${item.confidence.toFixed(1)}%)`}
                        color={item.sentiment === 'positive' ? 'success' : 'error'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default NewsSentiment; 