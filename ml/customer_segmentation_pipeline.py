"""
Main customer segmentation pipeline.
Combines all segmentation dimensions and outputs results in JSON format.
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging

from data_loader import DataLoader
from purchase_frequency_segmenter import PurchaseFrequencySegmenter
from spending_segmenter import SpendingSegmenter
from category_segmenter import CategorySegmenter

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CustomerSegmentationPipeline:
    """Main pipeline for automated customer segmentation."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the segmentation pipeline.
        
        Args:
            config: Configuration dictionary with pipeline settings
        """
        self.config = config or {}
        self.data_loader = DataLoader(config)
        self.frequency_segmenter = PurchaseFrequencySegmenter()
        self.spending_segmenter = SpendingSegmenter()
        self.category_segmenter = CategorySegmenter()
        
        # Output configuration
        self.output_dir = self.config.get('output_dir', '/Users/admin/PycharmProjects/PythonProject/output')
        self.output_filename = self.config.get('output_filename', 'customer_segmentation.json')
        self.create_output_dir()
        
    def create_output_dir(self):
        """Create output directory if it doesn't exist."""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            logger.info(f"Created output directory: {self.output_dir}")
    
    def run_segmentation_from_csv(self, csv_path: str) -> Dict[str, Any]:
        """
        Run complete segmentation pipeline from CSV data.
        
        Args:
            csv_path: Path to CSV file
            
        Returns:
            Dictionary with segmentation results and metadata
        """
        logger.info("Starting segmentation pipeline from CSV")
        
        # Load data
        df = self.data_loader.load_from_csv(csv_path)
        
        # Run segmentation
        return self._run_segmentation_pipeline(df, source="CSV", source_path=csv_path)
    
    def run_segmentation_from_mongodb(self) -> Dict[str, Any]:
        """
        Run complete segmentation pipeline from MongoDB data.
        
        Returns:
            Dictionary with segmentation results and metadata
        """
        logger.info("Starting segmentation pipeline from MongoDB")
        
        # Load data
        df = self.data_loader.load_from_mongodb()
        
        # Run segmentation
        return self._run_segmentation_pipeline(df, source="MongoDB")
    
    def _run_segmentation_pipeline(self, df: pd.DataFrame, source: str, source_path: str = None) -> Dict[str, Any]:
        """
        Internal method to run the complete segmentation pipeline.
        
        Args:
            df: DataFrame with customer purchase data
            source: Data source identifier
            source_path: Path to data source (if applicable)
            
        Returns:
            Dictionary with segmentation results and metadata
        """
        start_time = datetime.now()
        logger.info(f"Running segmentation on {len(df)} records")
        
        # Run all three segmentation dimensions
        logger.info("Running purchase frequency segmentation...")
        frequency_segments = self.frequency_segmenter.segment_customers(df)
        
        logger.info("Running spending amount segmentation...")
        spending_segments = self.spending_segmenter.segment_customers(df)
        
        logger.info("Running category-specific segmentation...")
        category_segments = self.category_segmenter.segment_customers(df)
        
        # Combine all segments
        logger.info("Combining segmentation results...")
        combined_segments = self._combine_segments(
            frequency_segments, spending_segments, category_segments
        )
        
        # Generate final output
        output_data = self._generate_output_json(combined_segments)
        
        # Save to file
        output_path = os.path.join(self.output_dir, self.output_filename)
        self._save_json_output(output_data, output_path)
        
        # Generate analysis report
        analysis = self._generate_analysis_report(df, frequency_segments, spending_segments, category_segments)
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        logger.info(f"Segmentation completed in {processing_time:.2f} seconds")
        
        return {
            'status': 'success',
            'output_file': output_path,
            'segmentation_data': output_data,
            'analysis': analysis,
            'metadata': {
                'source': source,
                'source_path': source_path,
                'total_records': len(df),
                'total_customers': combined_segments['customer_id'].nunique(),
                'processing_time_seconds': processing_time,
                'timestamp': datetime.now().isoformat(),
                'data_date_range': {
                    'start': df['purchase_date'].min().isoformat(),
                    'end': df['purchase_date'].max().isoformat()
                }
            }
        }
    
    def _combine_segments(self, frequency_segments: pd.DataFrame, 
                         spending_segments: pd.DataFrame, 
                         category_segments: pd.DataFrame) -> pd.DataFrame:
        """
        Combine all segmentation results into a single DataFrame.
        
        Args:
            frequency_segments: Purchase frequency segmentation results
            spending_segments: Spending amount segmentation results  
            category_segments: Category-specific segmentation results
            
        Returns:
            Combined DataFrame with all segments
        """
        # Start with frequency segments
        combined = frequency_segments.copy()
        
        # Merge spending segments
        combined = combined.merge(spending_segments, on='customer_id', how='outer')
        
        # Merge category segments
        combined = combined.merge(category_segments, on='customer_id', how='outer')
        
        # Handle any missing values (shouldn't happen with proper data)
        combined = combined.fillna({
            'purchase_frequency_segment': 'Unknown',
            'spending_segment': 'Unknown',
            'category_segment': 'Unknown'
        })
        
        logger.info(f"Combined segments for {len(combined)} customers")
        
        return combined
    
    def _generate_output_json(self, combined_segments: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Generate the final JSON output in the required format.
        
        Args:
            combined_segments: Combined segmentation results
            
        Returns:
            List of customer segmentation dictionaries
        """
        output_data = []
        
        for _, row in combined_segments.iterrows():
            customer_data = {
                "customer_id": row['customer_id'],
                "segmentation": {
                    "purchase_frequency": row['purchase_frequency_segment'],
                    "spending": row['spending_segment'],
                    "category": row['category_segment']
                }
            }
            output_data.append(customer_data)
        
        logger.info(f"Generated JSON output for {len(output_data)} customers")
        
        return output_data
    
    def _save_json_output(self, output_data: List[Dict[str, Any]], output_path: str):
        """
        Save segmentation results to JSON file.
        
        Args:
            output_data: List of customer segmentation dictionaries
            output_path: Path where to save the JSON file
        """
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        logger.info(f"Segmentation results saved to: {output_path}")
    
    def _generate_analysis_report(self, df: pd.DataFrame, 
                                frequency_segments: pd.DataFrame,
                                spending_segments: pd.DataFrame, 
                                category_segments: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate comprehensive analysis report of segmentation results.
        
        Args:
            df: Original purchase data
            frequency_segments: Purchase frequency segmentation results
            spending_segments: Spending amount segmentation results
            category_segments: Category-specific segmentation results
            
        Returns:
            Dictionary with analysis insights
        """
        analysis = {
            'summary': {
                'total_customers': df['customer_id'].nunique(),
                'total_transactions': len(df),
                'date_range': {
                    'start': df['purchase_date'].min().isoformat(),
                    'end': df['purchase_date'].max().isoformat()
                },
                'total_revenue': df['amount'].sum()
            },
            'frequency_analysis': self.frequency_segmenter.analyze_segments(df, frequency_segments),
            'spending_analysis': self.spending_segmenter.analyze_segments(df, spending_segments),
            'category_analysis': self.category_segmenter.analyze_segments(df, category_segments)
        }
        
        # Cross-segment analysis
        combined = self._combine_segments(frequency_segments, spending_segments, category_segments)
        analysis['cross_segment_analysis'] = self._analyze_segment_combinations(df, combined)
        
        return analysis
    
    def _analyze_segment_combinations(self, df: pd.DataFrame, combined_segments: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze combinations of segments across dimensions.
        
        Args:
            df: Original purchase data
            combined_segments: Combined segmentation results
            
        Returns:
            Dictionary with cross-segment analysis
        """
        # Merge with purchase data for analysis
        analysis_df = df.merge(combined_segments, on='customer_id', how='left')
        
        # Count combinations
        combination_counts = analysis_df.groupby([
            'purchase_frequency_segment', 'spending_segment', 'category_segment'
        ])['customer_id'].nunique().reset_index()
        combination_counts.columns = ['frequency', 'spending', 'category', 'customer_count']
        
        # Top combinations
        top_combinations = combination_counts.nlargest(10, 'customer_count')
        
        # Revenue by combination
        revenue_by_combination = analysis_df.groupby([
            'purchase_frequency_segment', 'spending_segment', 'category_segment'
        ])['amount'].sum().reset_index()
        revenue_by_combination.columns = ['frequency', 'spending', 'category', 'total_revenue']
        
        return {
            'top_customer_combinations': top_combinations.to_dict('records'),
            'revenue_by_combination': revenue_by_combination.to_dict('records'),
            'total_unique_combinations': len(combination_counts)
        }
    
    def get_segment_definitions(self) -> Dict[str, Dict[str, str]]:
        """
        Get definitions for all segments across all dimensions.
        
        Returns:
            Dictionary with segment definitions
        """
        return {
            'purchase_frequency': self.frequency_segmenter.get_segment_definitions(),
            'spending': self.spending_segmenter.get_segment_definitions(),
            'category': self.category_segmenter.get_segment_definitions()
        }