import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

class TradingModel:
    """
    Trading prediction model for generating Buy/Sell/Hold signals
    """
    def __init__(self, model_type='random_forest'):
        """
        Initialize the trading model
        
        Args:
            model_type (str): Type of model to use ('random_forest', 'logistic', 'decision_tree', 'gradient_boost')
        """
        self.model_type = model_type.lower()
        self.model = None
        self.feature_columns = None
        self.scaler = StandardScaler()
        self.model_path = None
        
    def _create_model(self):
        """
        Create the ML model based on the specified type
        """
        if self.model_type == 'random_forest':
            model = RandomForestClassifier(
                n_estimators=100, 
                max_depth=10, 
                min_samples_split=10,
                random_state=42
            )
        elif self.model_type == 'logistic':
            model = LogisticRegression(
                C=1.0, 
                class_weight='balanced',
                solver='liblinear', 
                random_state=42, 
                max_iter=1000
            )
        elif self.model_type == 'decision_tree':
            model = DecisionTreeClassifier(
                max_depth=5, 
                min_samples_split=10, 
                class_weight='balanced', 
                random_state=42
            )
        elif self.model_type == 'gradient_boost':
            model = GradientBoostingClassifier(
                n_estimators=100, 
                learning_rate=0.1, 
                max_depth=5, 
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
            
        return model
    
    def fit(self, X, y):
        """
        Train the model on the provided data
        
        Args:
            X (pandas.DataFrame): Feature matrix
            y (pandas.Series): Target variable (1=Buy, -1=Sell, 0=Hold)
            
        Returns:
            self: Trained model instance
        """
        # Remember the feature columns for prediction
        self.feature_columns = X.columns.tolist()
        
        # Create the model
        self.model = Pipeline([
            ('scaler', self.scaler),
            ('classifier', self._create_model())
        ])
        
        # Fit the model
        self.model.fit(X, y)
        
        return self
    
    def optimize_hyperparameters(self, X, y, cv=5):
        """
        Find the optimal hyperparameters for the model
        
        Args:
            X (pandas.DataFrame): Feature matrix
            y (pandas.Series): Target variable
            cv (int): Number of cross-validation folds
            
        Returns:
            self: Model instance with optimized hyperparameters
        """
        # Remember feature columns
        self.feature_columns = X.columns.tolist()
        
        # Define parameter grid based on model type
        if self.model_type == 'random_forest':
            param_grid = {
                'classifier__n_estimators': [50, 100, 200],
                'classifier__max_depth': [5, 10, 15],
                'classifier__min_samples_split': [5, 10, 20]
            }
        elif self.model_type == 'logistic':
            param_grid = {
                'classifier__C': [0.1, 1, 10],
                'classifier__solver': ['liblinear', 'saga'],
                'classifier__class_weight': [None, 'balanced']
            }
        elif self.model_type == 'decision_tree':
            param_grid = {
                'classifier__max_depth': [3, 5, 7, 10],
                'classifier__min_samples_split': [5, 10, 20],
                'classifier__criterion': ['gini', 'entropy']
            }
        elif self.model_type == 'gradient_boost':
            param_grid = {
                'classifier__n_estimators': [50, 100, 200],
                'classifier__learning_rate': [0.01, 0.1, 0.2],
                'classifier__max_depth': [3, 5, 7]
            }
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
        
        # Create the pipeline
        pipeline = Pipeline([
            ('scaler', self.scaler),
            ('classifier', self._create_model())
        ])
        
        # Grid search for optimal parameters
        grid_search = GridSearchCV(
            estimator=pipeline,
            param_grid=param_grid,
            cv=cv,
            scoring='accuracy',
            n_jobs=-1
        )
        
        # Fit grid search
        grid_search.fit(X, y)
        
        # Get best model
        self.model = grid_search.best_estimator_
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best score: {grid_search.best_score_:.4f}")
        
        return self
    
    def predict(self, X):
        """
        Generate predictions (Buy/Sell/Hold signals)
        
        Args:
            X (pandas.DataFrame): Feature matrix for prediction
            
        Returns:
            numpy.ndarray: Predicted signals (1=Buy, -1=Sell, 0=Hold)
        """
        if not self.model:
            raise ValueError("Model is not trained. Call fit() first.")
            
        # Ensure we have the expected features
        if self.feature_columns:
            missing_cols = set(self.feature_columns) - set(X.columns)
            if missing_cols:
                raise ValueError(f"Missing columns in input data: {missing_cols}")
                
            # Reorder columns to match training data
            X = X[self.feature_columns]
        
        # Generate predictions
        predictions = self.model.predict(X)
        
        return predictions
    
    def predict_proba(self, X):
        """
        Generate prediction probabilities
        
        Args:
            X (pandas.DataFrame): Feature matrix for prediction
            
        Returns:
            numpy.ndarray: Class probabilities
        """
        if not self.model:
            raise ValueError("Model is not trained. Call fit() first.")
            
        # Ensure we have the expected features
        if self.feature_columns:
            X = X[self.feature_columns]
        
        # Some models (like logistic) have predict_proba, but others don't
        try:
            probabilities = self.model.predict_proba(X)
            return probabilities
        except AttributeError:
            # If the model doesn't support probabilities, return None
            print(f"Model type {self.model_type} does not support prediction probabilities.")
            return None
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate the model performance
        
        Args:
            X_test (pandas.DataFrame): Test features
            y_test (pandas.Series): True labels
            
        Returns:
            dict: Performance metrics
        """
        if not self.model:
            raise ValueError("Model is not trained. Call fit() first.")
            
        # Generate predictions
        y_pred = self.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        conf_matrix = confusion_matrix(y_test, y_pred)
        
        # Print results
        print(f"Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print("\nConfusion Matrix:")
        print(conf_matrix)
        
        # Return as a dictionary
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': conf_matrix
        }
    
    def save_model(self, directory='models', filename=None):
        """
        Save the model to disk
        
        Args:
            directory (str): Directory to save the model
            filename (str): Filename to save the model (default is based on model type and date)
            
        Returns:
            str: Path to the saved model
        """
        if not self.model:
            raise ValueError("Model is not trained. Call fit() first.")
            
        # Create directory if it doesn't exist
        os.makedirs(directory, exist_ok=True)
        
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.model_type}_model_{timestamp}.joblib"
        
        # Full path to save the model
        model_path = os.path.join(directory, filename)
        
        # Save the model
        joblib.dump(self.model, model_path)
        
        # Save the feature columns as well
        feature_path = os.path.join(directory, f"{os.path.splitext(filename)[0]}_features.joblib")
        joblib.dump(self.feature_columns, feature_path)
        
        print(f"Model saved to {model_path}")
        self.model_path = model_path
        
        return model_path
    
    @classmethod
    def load_model(cls, model_path):
        """
        Load a trained model from disk
        
        Args:
            model_path (str): Path to the saved model
            
        Returns:
            TradingModel: Loaded model instance
        """
        # Extract model type from filename
        filename = os.path.basename(model_path)
        for model_type in ['random_forest', 'logistic', 'decision_tree', 'gradient_boost']:
            if model_type in filename.lower():
                break
        else:
            model_type = 'unknown'
        
        # Create an instance
        instance = cls(model_type=model_type)
        
        # Load the model
        instance.model = joblib.load(model_path)
        
        # Load feature columns if available
        feature_path = os.path.join(
            os.path.dirname(model_path), 
            f"{os.path.splitext(os.path.basename(model_path))[0]}_features.joblib"
        )
        
        if os.path.exists(feature_path):
            instance.feature_columns = joblib.load(feature_path)
        
        instance.model_path = model_path
        
        return instance
    
    def get_feature_importances(self):
        """
        Get feature importances if the model supports it
        
        Returns:
            dict: Feature names and their importance scores
        """
        if not self.model or not self.feature_columns:
            raise ValueError("Model is not trained or feature columns are not set")
            
        # Extract the classifier from the pipeline
        classifier = self.model.named_steps['classifier']
        
        # Check if the model has feature importances
        if hasattr(classifier, 'feature_importances_'):
            importances = classifier.feature_importances_
            feature_importance = {}
            for feature, importance in zip(self.feature_columns, importances):
                feature_importance[feature] = importance
            
            # Sort by importance value
            feature_importance = dict(sorted(
                feature_importance.items(), 
                key=lambda x: x[1], 
                reverse=True
            ))
            
            return feature_importance
        
        # For logistic regression, use coefficients
        elif hasattr(classifier, 'coef_'):
            importances = np.abs(classifier.coef_[0])
            feature_importance = {}
            for feature, importance in zip(self.feature_columns, importances):
                feature_importance[feature] = importance
            
            # Sort by importance value
            feature_importance = dict(sorted(
                feature_importance.items(), 
                key=lambda x: x[1], 
                reverse=True
            ))
            
            return feature_importance
        
        else:
            print(f"Model type {self.model_type} does not support feature importances")
            return None
