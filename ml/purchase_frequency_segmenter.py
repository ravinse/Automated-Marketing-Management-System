"""
Purchase frequency segmentation module.
Classifies customers based on their purchase patterns and timing.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class PurchaseFrequencySegmenter:
    """Handles purchase frequency-based customer segmentation."""
    
    def __init__(self, reference_date: datetime = None):
        """
        Initialize the segmenter.
        
        Args:
            reference_date: Date to use as reference for recency calculations.
                           Defaults to today's date.
        """
        self.reference_date = reference_date or datetime.now()
        self.festive_periods = self._define_festive_periods()
        
    def _define_festive_periods(self) -> list:
        """
        Define festive periods for seasonal customer detection.
        Sri Lankan context with major shopping seasons.
        
        Returns:
            List of dictionaries with start and end dates for festive periods
        """
        # Define major shopping seasons in Sri Lanka
        return [
            # Christmas and New Year season
            {'name': 'Christmas_New_Year', 'start_month': 12, 'start_day': 15, 
             'end_month': 1, 'end_day': 15},
            
            # Sinhala/Tamil New Year
            {'name': 'Sinhala_Tamil_New_Year', 'start_month': 4, 'start_day': 1, 
             'end_month': 4, 'end_day': 30},
             
            # Back to school season
            {'name': 'Back_to_School', 'start_month': 1, 'start_day': 1, 
             'end_month': 2, 'end_day': 15},
             
            # Vesak season
            {'name': 'Vesak', 'start_month': 5, 'start_day': 1, 
             'end_month': 5, 'end_day': 31},
             
            # Mid-year sales period
            {'name': 'Mid_Year_Sales', 'start_month': 6, 'start_day': 15, 
             'end_month': 7, 'end_day': 15},
        ]
    
    def _is_festive_period(self, date: datetime) -> bool:
        """
        Check if a given date falls within any festive period.
        
        Args:
            date: Date to check
            
        Returns:
            Boolean indicating if date is in festive period
        """
        month = date.month
        day = date.day
        
        for period in self.festive_periods:
            start_month = period['start_month']
            start_day = period['start_day']
            end_month = period['end_month']
            end_day = period['end_day']
            
            # Handle year-spanning periods (like Christmas to New Year)
            if start_month > end_month:
                if (month == start_month and day >= start_day) or \
                   (month == end_month and day <= end_day) or \
                   (month > start_month or month < end_month):
                    return True
            else:
                if (month == start_month and day >= start_day and month == end_month and day <= end_day) or \
                   (month == start_month and day >= start_day and month < end_month) or \
                   (month > start_month and month < end_month) or \
                   (month == end_month and day <= end_day and month > start_month):
                    return True
                    
        return False
    
    def segment_customers(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Segment customers based on purchase frequency patterns.
        
        Args:
            df: DataFrame with customer purchase data
            
        Returns:
            DataFrame with customer_id and purchase_frequency_segment columns
        """
        logger.info("Starting purchase frequency segmentation")
        
        # Calculate purchase statistics per customer
        customer_stats = df.groupby('customer_id').agg({
            'purchase_date': ['count', 'min', 'max'],
            'purchase_id': 'nunique'
        }).round(2)
        
        # Flatten column names
        customer_stats.columns = ['_'.join(col).strip() for col in customer_stats.columns]
        customer_stats = customer_stats.rename(columns={
            'purchase_date_count': 'total_purchases',
            'purchase_date_min': 'first_purchase_date',
            'purchase_date_max': 'last_purchase_date',
            'purchase_id_nunique': 'unique_purchases'
        })
        
        # Calculate days since last purchase
        customer_stats['days_since_last_purchase'] = (
            self.reference_date - customer_stats['last_purchase_date']
        ).dt.days
        
        # Calculate recent purchases (last 6 months)
        six_months_ago = self.reference_date - timedelta(days=180)
        recent_purchases = df[df['purchase_date'] >= six_months_ago].groupby('customer_id').size()
        customer_stats['recent_purchases_6m'] = customer_stats.index.map(recent_purchases).fillna(0)
        
        # Check if customers are seasonal (majority of purchases during festive periods)
        df['is_festive'] = df['purchase_date'].apply(self._is_festive_period)
        festive_purchases = df.groupby('customer_id')['is_festive'].agg(['sum', 'count'])
        festive_purchases['festive_ratio'] = festive_purchases['sum'] / festive_purchases['count']
        customer_stats['festive_ratio'] = customer_stats.index.map(festive_purchases['festive_ratio']).fillna(0)
        
        # Apply segmentation rules
        customer_stats['purchase_frequency_segment'] = customer_stats.apply(
            self._classify_customer, axis=1
        )
        
        # Return only customer_id and segment
        result = customer_stats[['purchase_frequency_segment']].reset_index()
        
        logger.info("Purchase frequency segmentation completed")
        logger.info(f"Segment distribution:\n{result['purchase_frequency_segment'].value_counts()}")
        
        return result
    
    def _classify_customer(self, row) -> str:
        """
        Classify a single customer based on purchase frequency rules.
        
        Args:
            row: Series with customer statistics
            
        Returns:
            Segment name
        """
        total_purchases = row['total_purchases']
        recent_purchases_6m = row['recent_purchases_6m']
        days_since_last = row['days_since_last_purchase']
        festive_ratio = row['festive_ratio']
        
        # Rule 1: New customer (only 1 purchase)
        if total_purchases == 1:
            return "New"
        
        # Rule 2: Lapsed customer (no purchases in last 90 days)
        if days_since_last > 90:
            return "Lapsed"
        
        # Rule 3: Seasonal customer (80%+ purchases during festive periods)
        if festive_ratio >= 0.8 and total_purchases >= 2:
            return "Seasonal"
        
        # Rule 4: Loyal customer (5+ purchases in last 6 months)
        if recent_purchases_6m >= 5:
            return "Loyal"
        
        # Default: Could be developing loyalty but not quite there yet
        # Let's classify them based on recency and frequency
        if days_since_last <= 30 and total_purchases >= 3:
            return "Loyal"
        elif days_since_last <= 60:
            return "New"  # Recent but not frequent enough for loyal
        else:
            return "Lapsed"
    
    def get_segment_definitions(self) -> Dict[str, str]:
        """
        Get human-readable definitions for each segment.
        
        Returns:
            Dictionary mapping segment names to definitions
        """
        return {
            "New": "Customer has only 1 purchase (first-time buyer) or recent activity but low frequency",
            "Loyal": "Customer has 5 or more purchases in the last 6 months or consistent recent activity",
            "Lapsed": "Customer has made no purchases in the last 90 days",
            "Seasonal": "Customer purchases mainly during festive periods (80%+ of purchases)"
        }
    
    def analyze_segments(self, df: pd.DataFrame, segments: pd.DataFrame) -> Dict[str, Any]:
        """
        Provide detailed analysis of the segmentation results.
        
        Args:
            df: Original purchase data
            segments: Segmentation results
            
        Returns:
            Dictionary with analysis insights
        """
        # Merge segments with purchase data
        analysis_df = df.merge(segments, on='customer_id', how='left')
        
        # Calculate segment statistics
        segment_stats = analysis_df.groupby('purchase_frequency_segment').agg({
            'customer_id': 'nunique',
            'amount': ['sum', 'mean'],
            'purchase_date': ['min', 'max']
        }).round(2)
        
        segment_stats.columns = ['_'.join(col).strip() for col in segment_stats.columns]
        
        return {
            'segment_counts': segments['purchase_frequency_segment'].value_counts().to_dict(),
            'segment_stats': segment_stats.to_dict(),
            'total_customers': segments['customer_id'].nunique(),
            'reference_date': self.reference_date.strftime('%Y-%m-%d')
        }