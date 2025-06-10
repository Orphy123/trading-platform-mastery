import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { SentimentSatisfied, SentimentNeutral, SentimentDissatisfied } from '@mui/icons-material';

const NewsSentiment = ({ selectedAsset }) => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!selectedAsset) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${selectedAsset}`);
        const data = await response.json();
        setNews(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedAsset]);

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

  if (!news) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography>Select an asset to view news</Typography>
      </Paper>
    );
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentSatisfied color="success" />;
      case 'negative':
        return <SentimentDissatisfied color="error" />;
      default:
        return <SentimentNeutral color="warning" />;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        News & Sentiment
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Overall Sentiment
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSentimentIcon(news.overallSentiment.label)}
          <Typography variant="h6" color={news.overallSentiment.label === 'positive' ? 'success' : news.overallSentiment.label === 'negative' ? 'error' : 'warning'}>
            {news.overallSentiment.label.charAt(0).toUpperCase() + news.overallSentiment.label.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({news.overallSentiment.score.toFixed(2)})
          </Typography>
        </Box>
      </Box>

      <List>
        {news.articles.map((article, index) => (
          <ListItem key={article.publishedAt} divider={index !== news.articles.length - 1}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSentimentIcon(article.sentiment)}
                  <Typography variant="subtitle1">{article.title}</Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {article.source}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {new Date(article.publishedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NewsSentiment; 