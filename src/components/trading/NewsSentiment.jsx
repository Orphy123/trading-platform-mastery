import { useState, useEffect } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const NewsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const NewsList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  '& .MuiListItem-root': {
    padding: theme.spacing(1, 0),
  },
}));

const SentimentChip = styled(Chip)(({ sentiment }) => ({
  backgroundColor: sentiment === 'positive' ? 'rgba(38, 166, 154, 0.1)' :
                  sentiment === 'negative' ? 'rgba(239, 83, 80, 0.1)' :
                  'rgba(33, 150, 243, 0.1)',
  color: sentiment === 'positive' ? '#26a69a' :
         sentiment === 'negative' ? '#ef5350' :
         '#2196f3',
  border: `1px solid ${sentiment === 'positive' ? '#26a69a' :
                               sentiment === 'negative' ? '#ef5350' :
                               '#2196f3'}`,
}));

const NewsSentiment = ({ asset }) => {
  const [news, setNews] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState({
    score: 0,
    label: 'neutral',
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/news/${asset}`);
        const data = await response.json();
        setNews(data.articles);
        setOverallSentiment(data.overallSentiment);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, [asset]);

  return (
    <NewsCard>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          News & Sentiment
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Overall Sentiment:
          </Typography>
          <SentimentChip
            label={overallSentiment.label.toUpperCase()}
            sentiment={overallSentiment.label}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            ({(overallSentiment.score * 100).toFixed(1)}%)
          </Typography>
        </Box>
      </Box>

      <NewsList>
        {news.map((article, index) => (
          <Box key={article.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" component="span">
                      {article.title}
                    </Typography>
                    <SentimentChip
                      label={article.sentiment}
                      sentiment={article.sentiment}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {article.summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(article.publishedAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < news.length - 1 && <Divider />}
          </Box>
        ))}
      </NewsList>
    </NewsCard>
  );
};

export default NewsSentiment; 