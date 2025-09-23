"""
Spending amount segmentation module.
Classifies customers based on their spending behavior and value.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class SpendingSegmenter:
    """Handles spending-based customer segmentation."""
    
    def __init__(self, high_aov_threshold: float = 15000, 
                 high_lifetime_threshold: float = 150000,
                 low_lifetime_threshold: float = 10000):
        """
        Initialize the spending segmenter.
        
        Args:
            high_aov_threshold: Average order value threshold for high value customers
            high_lifetime_threshold: Lifetime spending threshold for high value customers
            low_lifetime_threshold: Lifetime spending threshold for low value customers
        """
        self.high_aov_threshold = high_aov_threshold
        self.high_lifetime_threshold = high_lifetime_threshold
        self.low_lifetime_threshold = low_lifetime_threshold
        
    def segment_customers(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Segment customers based on spending patterns.
        
        Args:
            df: DataFrame with customer purchase data
            
        Returns:
            DataFrame with customer_id and spending_segment columns
        """
        logger.info("Starting spending amount segmentation")
        
        # Calculate spending statistics per customer
        customer_spending = df.groupby('customer_id').agg({
            'amount': ['sum', 'mean', 'count', 'std'],
            'purchase_id': 'nunique'
        }).round(2)
        
        # Flatten column names
        customer_spending.columns = ['_'.join(col).strip() for col in customer_spending.columns]
        customer_spending = customer_spending.rename(columns={
            'amount_sum': 'lifetime_spending',
            'amount_mean': 'average_order_value',
            'amount_count': 'total_transactions',
            'amount_std': 'spending_volatility',
            'purchase_id_nunique': 'unique_orders'
        })
        
        # Handle missing standard deviation (customers with only 1 purchase)
        customer_spending['spending_volatility'] = customer_spending['spending_volatility'].fillna(0)
        
        # Calculate additional metrics
        customer_spending['avg_amount_per_order'] = (
            customer_spending['lifetime_spending'] / customer_spending['unique_orders']
        )
        
        # Apply segmentation rules
        customer_spending['spending_segment'] = customer_spending.apply(
            self._classify_customer, axis=1
        )
        
        # Return only customer_id and segment
        result = customer_spending[['spending_segment']].reset_index()
        
        logger.info("Spending amount segmentation completed")
        logger.info(f"Segment distribution:\n{result['spending_segment'].value_counts()}")
        
        return result
    
    def _classify_customer(self, row) -> str:
        """
        Classify a single customer based on spending rules.
        
        Args:
            row: Series with customer spending statistics
            
        Returns:
            Segment name
        """
        lifetime_spending = row['lifetime_spending']
        average_order_value = row['average_order_value']
        avg_amount_per_order = row['avg_amount_per_order']
        
        # Use the higher of AOV or avg amount per order for more accurate classification
        effective_aov = max(average_order_value, avg_amount_per_order)
        
        # Rule 1: High Value Customer
        # AOV >= 15,000 OR Lifetime spend >= 150,000
        if effective_aov >= self.high_aov_threshold or lifetime_spending >= self.high_lifetime_threshold:
            return "High Value Customer"
        
        # Rule 2: Low Value Customer  
        # Lifetime spending <= 10,000
        if lifetime_spending <= self.low_lifetime_threshold:
            return "Low Value Customer"
        
        # Rule 3: Medium Value (everyone else in between)
        return "Medium Value"
    
    def get_segment_definitions(self) -> Dict[str, str]:
        """
        Get human-readable definitions for each segment.
        
        Returns:
            Dictionary mapping segment names to definitions
        """
        return {
            "High Value Customer": f"Average order value ≥ {self.high_aov_threshold:,} OR Lifetime spend ≥ {self.high_lifetime_threshold:,}",
            "Low Value Customer": f"Lifetime spending ≤ {self.low_lifetime_threshold:,}",
            "Medium Value": f"Lifetime spending between {self.low_lifetime_threshold:,} and {self.high_lifetime_threshold:,} with AOV < {self.high_aov_threshold:,}"
        }
    
    def analyze_segments(self, df: pd.DataFrame, segments: pd.DataFrame) -> Dict[str, Any]:
        """
        Provide detailed analysis of the spending segmentation results.
        
        Args:
            df: Original purchase data  
            segments: Segmentation results
            
        Returns:
            Dictionary with analysis insights
        """
        # Merge segments with purchase data
        analysis_df = df.merge(segments, on='customer_id', how='left')
        
        # Calculate detailed segment statistics
        segment_stats = analysis_df.groupby('spending_segment').agg({
            'customer_id': 'nunique',
            'amount': ['sum', 'mean', 'median', 'std', 'min', 'max'],
            'purchase_id': 'nunique'
        }).round(2)
        
        segment_stats.columns = ['_'.join(col).strip() for col in segment_stats.columns]
        
        # Calculate customer-level statistics for each segment
        customer_level_stats = analysis_df.groupby(['customer_id', 'spending_segment'])['amount'].agg(['sum', 'mean', 'count']).reset_index()
        
        segment_customer_stats = customer_level_stats.groupby('spending_segment').agg({
            'sum': ['mean', 'median', 'std'],  # Lifetime value stats
            'mean': ['mean', 'median', 'std'],  # AOV stats  
            'count': ['mean', 'median', 'std']  # Purchase frequency stats
        }).round(2)
        
        segment_customer_stats.columns = ['_'.join(col).strip() for col in segment_customer_stats.columns]
        
        # Calculate revenue contribution by segment
        total_revenue = analysis_df['amount'].sum()
        revenue_by_segment = analysis_df.groupby('spending_segment')['amount'].sum()
        revenue_contribution = (revenue_by_segment / total_revenue * 100).round(2)
        
        return {
            'segment_counts': segments['spending_segment'].value_counts().to_dict(),
            'segment_transaction_stats': segment_stats.to_dict(),
            'segment_customer_stats': segment_customer_stats.to_dict(),
            'revenue_contribution_percent': revenue_contribution.to_dict(),
            'total_customers': segments['customer_id'].nunique(),
            'total_revenue': total_revenue,
            'thresholds': {
                'high_aov_threshold': self.high_aov_threshold,
                'high_lifetime_threshold': self.high_lifetime_threshold,
                'low_lifetime_threshold': self.low_lifetime_threshold
            }
        }
    
    def get_customer_spending_details(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Get detailed spending metrics for all customers.
        
        Args:
            df: DataFrame with customer purchase data
            
        Returns:
            DataFrame with detailed customer spending metrics
        """
        customer_details = df.groupby('customer_id').agg({
            'amount': ['sum', 'mean', 'median', 'std', 'min', 'max', 'count'],
            'purchase_id': 'nunique',
            'purchase_date': ['min', 'max']
        }).round(2)
        
        # Flatten column names
        customer_details.columns = ['_'.join(col).strip() for col in customer_details.columns]
        
        # Add calculated fields
        customer_details['avg_amount_per_order'] = (
            customer_details['amount_sum'] / customer_details['purchase_id_nunique']
        )
        
        customer_details['customer_lifetime_days'] = (
            pd.to_datetime(customer_details['purchase_date_max']) - 
            pd.to_datetime(customer_details['purchase_date_min'])
        ).dt.days
        
        return customer_details.reset_index()