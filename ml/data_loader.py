"""
Data loader module for customer segmentation pipeline.
Handles both CSV and MongoDB data sources.
"""

import pandas as pd
import numpy as np
from pymongo import MongoClient
from urllib.parse import quote_plus
from typing import Optional, Dict, Any
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    """Data loader that can read from CSV files or MongoDB."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the data loader.
        
        Args:
            config: Configuration dictionary containing connection details
        """
        self.config = config or {}
        self.df = None
        
    def load_from_csv(self, csv_path: str) -> pd.DataFrame:
        """
        Load data from CSV file.
        
        Args:
            csv_path: Path to the CSV file
            
        Returns:
            DataFrame with standardized column names
        """
        logger.info(f"Loading data from CSV: {csv_path}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
            
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} records from CSV")
        
        # Standardize column names to match requirements
        df = self._standardize_columns(df)
        
        self.df = df
        return df
    
    def load_from_mongodb(self) -> pd.DataFrame:
        """
        Load data from MongoDB.
        
        Returns:
            DataFrame with standardized column names
        """
        logger.info("Loading data from MongoDB")
        
        # MongoDB connection details
        username = "rasenadheera_db_user"
        password = quote_plus("dY9bjEne4o1DYZGn")
        db_name = "retail_db"
        
        client = MongoClient(
            f"mongodb+srv://{username}:{password}@mayfashion.vv9xibz.mongodb.net/{db_name}?retryWrites=true&w=majority"
        )
        db = client[db_name]
        collection = db["purchases"]
        
        # Load data
        data = list(collection.find())
        if not data:
            raise ValueError("No data found in MongoDB collection")
            
        df = pd.DataFrame(data)
        logger.info(f"Loaded {len(df)} records from MongoDB")
        
        # Expand customer dictionary
        if 'customer' in df.columns:
            df['customer_id'] = df['customer'].apply(lambda x: x.get('id'))
            df['customer_name'] = df['customer'].apply(lambda x: x.get('name'))
            df['customer_gender'] = df['customer'].apply(lambda x: x.get('gender'))
            df.drop(columns=['customer'], inplace=True)
        
        # Expand product dictionary
        if 'product' in df.columns:
            df['product_id'] = df['product'].apply(lambda x: x.get('id'))
            df['product_name'] = df['product'].apply(lambda x: x.get('name'))
            df['product_category'] = df['product'].apply(lambda x: x.get('category'))
            df.drop(columns=['product'], inplace=True)
        
        # Standardize column names
        df = self._standardize_columns(df)
        
        self.df = df
        return df
    
    def _standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Standardize column names to match segmentation requirements.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with standardized columns
        """
        # Column mapping from source to standard names
        column_mapping = {
            # CSV format
            'Customer_ID': 'customer_id',
            'Order_ID': 'purchase_id', 
            'Date': 'purchase_date',
            'Total_Amount_LKR': 'amount',
            'Product_Category': 'category',
            
            # MongoDB format (already lowercased in load_from_mongodb)
            'customer_id': 'customer_id',
            'order_id': 'purchase_id',
            'date': 'purchase_date', 
            'total_amount_lkr': 'amount',
            'product_category': 'category',
        }
        
        # Rename columns
        df = df.rename(columns=column_mapping)
        
        # Ensure required columns exist
        required_columns = ['customer_id', 'purchase_id', 'purchase_date', 'amount', 'category']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            logger.warning(f"Missing required columns: {missing_columns}")
            
        # Convert data types
        if 'purchase_date' in df.columns:
            df['purchase_date'] = pd.to_datetime(df['purchase_date'], errors='coerce')
            
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            
        # Map category names to standard format
        if 'category' in df.columns:
            category_mapping = {
                'Women': 'Womens',
                'Men': 'Mens', 
                'Kids': 'Kids'
            }
            df['category'] = df['category'].map(category_mapping).fillna(df['category'])
        
        # Remove any rows with missing critical data
        initial_rows = len(df)
        df = df.dropna(subset=['customer_id', 'purchase_date', 'amount'])
        if len(df) < initial_rows:
            logger.info(f"Removed {initial_rows - len(df)} rows with missing critical data")
            
        return df
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """
        Get summary statistics about the loaded data.
        
        Returns:
            Dictionary with summary statistics
        """
        if self.df is None:
            raise ValueError("No data loaded. Call load_from_csv() or load_from_mongodb() first.")
            
        df = self.df
        
        return {
            'total_records': len(df),
            'unique_customers': df['customer_id'].nunique(),
            'date_range': {
                'start': df['purchase_date'].min(),
                'end': df['purchase_date'].max()
            },
            'amount_stats': {
                'min': df['amount'].min(),
                'max': df['amount'].max(),
                'mean': df['amount'].mean(),
                'median': df['amount'].median()
            },
            'categories': df['category'].value_counts().to_dict(),
            'customers_with_multiple_purchases': (df.groupby('customer_id').size() > 1).sum()
        }