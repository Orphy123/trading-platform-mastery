from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime

class SentimentAnalyzer:
    """
    A class for analyzing sentiment of financial news articles
    using both VADER and TextBlob
    """
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        
    def analyze_text(self, text):
        """
        Analyze sentiment of a text using both VADER and TextBlob
        
        Args:
            text (str): The text to analyze
            
        Returns:
            dict: Sentiment scores from both analyzers
        """
        if not text:
            return {
                'vader_compound': 0,
                'vader_pos': 0,
                'vader_neg': 0,
                'vader_neu': 0,
                'textblob_polarity': 0,
                'textblob_subjectivity': 0,
                'sentiment_label': 'neutral'
            }
        
        # VADER sentiment analysis
        vader_scores = self.vader.polarity_scores(text)
        
        # TextBlob sentiment analysis
        tb = TextBlob(text)
        textblob_polarity = tb.sentiment.polarity
        textblob_subjectivity = tb.sentiment.subjectivity
        
        # Combined sentiment label
        # Use VADER's compound score as the primary indicator
        if vader_scores['compound'] >= 0.05:
            sentiment_label = 'positive'
        elif vader_scores['compound'] <= -0.05:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        return {
            'vader_compound': vader_scores['compound'],
            'vader_pos': vader_scores['pos'],
            'vader_neg': vader_scores['neg'],
            'vader_neu': vader_scores['neu'],
            'textblob_polarity': textblob_polarity,
            'textblob_subjectivity': textblob_subjectivity,
            'sentiment_label': sentiment_label
        }
    
    def analyze_article(self, article):
        """
        Analyze sentiment of a news article
        
        Args:
            article (dict): News article dictionary
            
        Returns:
            dict: Original article with added sentiment analysis
        """
        # Create a combined text from title and description
        title = article.get('title', '')
        description = article.get('description', '')
        combined_text = f"{title}. {description}"
        
        # Get sentiment scores
        sentiment_scores = self.analyze_text(combined_text)
        
        # Add to the article dictionary
        article.update({
            'sentiment': sentiment_scores,
            'analyzed_at': datetime.now().isoformat()
        })
        
        return article
    
    def extract_key_phrases(self, text, max_phrases=5):
        """
        Extract key phrases from text
        
        Args:
            text (str): Input text
            max_phrases (int): Maximum number of phrases to extract
            
        Returns:
            list: List of key phrases
        """
        if not text:
            return []
            
        # Simple noun phrase extraction
        tb = TextBlob(text)
        noun_phrases = list(tb.noun_phrases)
        
        # Simple keyword extraction based on POS tagging
        important_tags = ['NN', 'NNS', 'NNP', 'NNPS', 'JJ']
        words = tb.tags  # Get words with POS tags
        keywords = [word for word, tag in words if tag in important_tags]
        
        # Combine phrases and keywords, remove duplicates
        all_phrases = noun_phrases + keywords
        unique_phrases = list(set(all_phrases))
        
        # Sort by length (favor longer phrases) and return top N
        sorted_phrases = sorted(unique_phrases, key=len, reverse=True)
        
        return sorted_phrases[:max_phrases]
