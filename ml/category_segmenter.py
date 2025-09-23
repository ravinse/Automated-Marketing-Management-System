"""
Category-specific segmentation module.
Classifies customers based on their purchase preferences across product categories.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class CategorySegmenter:
    """Handles category-based customer segmentation."""
    
    def __init__(self, family_threshold: float = 0.3, dominant_threshold: float = 0.7):
        """
        Initialize the category segmenter.
        
        Args:
            family_threshold: Minimum percentage in secondary category to be considered Family
            dominant_threshold: Minimum percentage in one category to be considered specialized
        """
        self.family_threshold = family_threshold
        self.dominant_threshold = dominant_threshold
        
    def segment_customers(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Segment customers based on category purchase patterns.
        
        Args:
            df: DataFrame with customer purchase data
            
        Returns:
            DataFrame with customer_id and category_segment columns
        """
        logger.info("Starting category-specific segmentation")
        
        # Calculate category distribution per customer
        # Group by customer and category, sum amounts
        customer_category_spending = df.groupby(['customer_id', 'category'])['amount'].sum().unstack(fill_value=0)
        
        # Calculate total spending per customer
        customer_category_spending['total_spending'] = customer_category_spending.sum(axis=1)
        
        # Calculate percentage distribution
        category_columns = ['Womens', 'Mens', 'Kids']
        available_categories = [col for col in category_columns if col in customer_category_spending.columns]
        
        for category in available_categories:
            customer_category_spending[f'{category}_pct'] = (
                customer_category_spending[category] / customer_category_spending['total_spending']
            ).fillna(0)
        
        # Calculate number of categories purchased from
        customer_category_spending['categories_purchased'] = (customer_category_spending[available_categories] > 0).sum(axis=1)
        
        # Apply segmentation rules
        customer_category_spending['category_segment'] = customer_category_spending.apply(
            self._classify_customer, axis=1, available_categories=available_categories
        )
        
        # Return only customer_id and segment
        result = customer_category_spending[['category_segment']].reset_index()
        
        logger.info("Category-specific segmentation completed")
        logger.info(f"Segment distribution:\n{result['category_segment'].value_counts()}")
        
        return result
    
    def _classify_customer(self, row, available_categories: list) -> str:
        """
        Classify a single customer based on category preferences.
        
        Args:
            row: Series with customer category statistics
            available_categories: List of available category columns
            
        Returns:
            Segment name
        """
        categories_purchased = row['categories_purchased']
        
        # Get percentage columns
        pct_columns = {cat: f'{cat}_pct' for cat in available_categories if f'{cat}_pct' in row.index}
        
        # Rule 1: Single category customers (70%+ in one category)
        for category in available_categories:
            pct_col = f'{category}_pct'
            if pct_col in row.index and row[pct_col] >= self.dominant_threshold:
                return category
        
        # Rule 2: Family customers (purchases across multiple categories)
        if categories_purchased >= 2:
            # Check for meaningful purchases in multiple categories
            significant_categories = []
            for category in available_categories:
                pct_col = f'{category}_pct'
                if pct_col in row.index and row[pct_col] >= self.family_threshold:
                    significant_categories.append(category)
            
            if len(significant_categories) >= 2:
                return "Family"
        
        # Rule 3: Default to dominant category even if below threshold
        max_category = None
        max_percentage = 0
        
        for category in available_categories:
            pct_col = f'{category}_pct'
            if pct_col in row.index and row[pct_col] > max_percentage:
                max_percentage = row[pct_col]
                max_category = category
        
        # If we have a clear preference (even if below 70%), use it
        if max_category and max_percentage > 0.4:  # At least 40% preference
            return max_category
        
        # If still no clear preference, classify as Family
        return "Family"
    
    def get_segment_definitions(self) -> Dict[str, str]:
        """
        Get human-readable definitions for each segment.
        
        Returns:
            Dictionary mapping segment names to definitions
        """
        return {
            "Womens": f"≥{self.dominant_threshold*100:.0f}% of purchases in women's clothing",
            "Mens": f"≥{self.dominant_threshold*100:.0f}% of purchases in men's clothing", 
            "Kids": f"≥{self.dominant_threshold*100:.0f}% of purchases in kids' clothing",
            "Family": f"Purchases across multiple categories with ≥{self.family_threshold*100:.0f}% in at least 2 categories"
        }
    
    def analyze_segments(self, df: pd.DataFrame, segments: pd.DataFrame) -> Dict[str, Any]:
        """
        Provide detailed analysis of the category segmentation results.
        
        Args:
            df: Original purchase data
            segments: Segmentation results
            
        Returns:
            Dictionary with analysis insights
        """
        # Merge segments with purchase data
        analysis_df = df.merge(segments, on='customer_id', how='left')
        
        # Calculate category distribution by segment
        category_by_segment = analysis_df.groupby(['category_segment', 'category'])['amount'].agg(['sum', 'count']).round(2)
        
        # Calculate customer-level category preferences
        customer_category_analysis = df.groupby(['customer_id', 'category'])['amount'].sum().unstack(fill_value=0)
        customer_category_analysis['total'] = customer_category_analysis.sum(axis=1)
        
        # Add percentage calculations
        for col in ['Womens', 'Mens', 'Kids']:
            if col in customer_category_analysis.columns:
                customer_category_analysis[f'{col}_pct'] = (
                    customer_category_analysis[col] / customer_category_analysis['total'] * 100
                ).round(2)
        
        # Merge with segments
        customer_category_analysis = customer_category_analysis.reset_index().merge(segments, on='customer_id')
        
        # Calculate average category percentages by segment
        segment_category_preferences = customer_category_analysis.groupby('category_segment')[
            [col for col in customer_category_analysis.columns if col.endswith('_pct')]
        ].mean().round(2)
        
        # Calculate cross-shopping behavior
        customer_category_analysis['categories_purchased'] = (
            customer_category_analysis[['Womens', 'Mens', 'Kids']] > 0
        ).sum(axis=1)
        
        cross_shopping = customer_category_analysis.groupby('category_segment')['categories_purchased'].agg([
            'mean', 'std', 'min', 'max'
        ]).round(2)
        
        return {
            'segment_counts': segments['category_segment'].value_counts().to_dict(),
            'category_distribution_by_segment': category_by_segment.to_dict(),
            'segment_category_preferences': segment_category_preferences.to_dict(),
            'cross_shopping_behavior': cross_shopping.to_dict(),
            'total_customers': segments['customer_id'].nunique(),
            'thresholds': {
                'family_threshold': self.family_threshold,
                'dominant_threshold': self.dominant_threshold
            }
        }
    
    def get_customer_category_details(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Get detailed category purchase patterns for all customers.
        
        Args:
            df: DataFrame with customer purchase data
            
        Returns:
            DataFrame with detailed customer category metrics
        """
        # Calculate spending by category per customer
        customer_category_details = df.groupby(['customer_id', 'category']).agg({
            'amount': ['sum', 'mean', 'count'],
            'purchase_id': 'nunique'
        }).round(2)
        
        # Flatten and pivot
        customer_category_details.columns = ['_'.join(col).strip() for col in customer_category_details.columns]
        customer_category_details = customer_category_details.reset_index()
        
        # Pivot to get categories as columns
        category_spending = customer_category_details.pivot_table(
            index='customer_id',
            columns='category', 
            values='amount_sum',
            fill_value=0
        )
        
        category_transactions = customer_category_details.pivot_table(
            index='customer_id',
            columns='category',
            values='amount_count', 
            fill_value=0
        )
        
        # Combine and calculate percentages
        result = category_spending.copy()
        result['total_spending'] = result.sum(axis=1)
        
        for col in result.columns:
            if col != 'total_spending':
                result[f'{col}_pct'] = (result[col] / result['total_spending'] * 100).round(2)
                result[f'{col}_transactions'] = category_transactions[col] if col in category_transactions.columns else 0
        
        result['categories_purchased'] = (category_spending > 0).sum(axis=1)
        
        return result.reset_index()