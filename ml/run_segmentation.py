"""
Simple automation runner for customer segmentation pipeline.
Can be run manually or scheduled via cron jobs.
"""

import os
import json
import argparse
from datetime import datetime
from typing import Dict, Any
import logging

from customer_segmentation_pipeline import CustomerSegmentationPipeline

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_segmentation(source: str = 'csv', csv_path: str = None, config: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run customer segmentation pipeline.
    
    Args:
        source: Data source ('csv' or 'mongodb')
        csv_path: Path to CSV file (required if source='csv')
        config: Configuration dictionary
        
    Returns:
        Segmentation results
    """
    logger.info(f"Starting segmentation from {source}")
    
    # Use default config if none provided
    if config is None:
        config = {
            'output_dir': '/Users/admin/PycharmProjects/PythonProject/output',
            'output_filename': 'customer_segmentation.json'
        }
    
    # Initialize pipeline
    pipeline = CustomerSegmentationPipeline(config)
    
    # Run segmentation based on source
    if source == 'csv':
        if csv_path is None:
            csv_path = '/Users/admin/PycharmProjects/PythonProject/db/purchase_records.csv'
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
            
        result = pipeline.run_segmentation_from_csv(csv_path)
        
    elif source == 'mongodb':
        result = pipeline.run_segmentation_from_mongodb()
        
    else:
        raise ValueError(f"Unknown source: {source}")
    
    return result

def save_run_log(result: Dict[str, Any], log_file: str = None):
    """
    Save run information to a log file.
    
    Args:
        result: Segmentation results
        log_file: Path to log file
    """
    if log_file is None:
        log_file = '/Users/admin/PycharmProjects/PythonProject/output/segmentation_runs.log'
    
    # Prepare log entry
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'status': result.get('status'),
        'total_customers': result.get('metadata', {}).get('total_customers'),
        'total_records': result.get('metadata', {}).get('total_records'),
        'processing_time': result.get('metadata', {}).get('processing_time_seconds'),
        'output_file': result.get('output_file'),
        'source': result.get('metadata', {}).get('source')
    }
    
    # Append to log file
    try:
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
        logger.info(f"Run logged to: {log_file}")
    except Exception as e:
        logger.error(f"Failed to write log: {e}")

def check_data_freshness(csv_path: str = None) -> Dict[str, Any]:
    """
    Check if data has been updated since last segmentation.
    
    Args:
        csv_path: Path to CSV file
        
    Returns:
        Dictionary with freshness information
    """
    if csv_path is None:
        csv_path = '/Users/admin/PycharmProjects/PythonProject/db/purchase_records.csv'
    
    output_file = '/Users/admin/PycharmProjects/PythonProject/output/customer_segmentation.json'
    
    data_modified = None
    output_modified = None
    
    if os.path.exists(csv_path):
        data_modified = datetime.fromtimestamp(os.path.getmtime(csv_path))
    
    if os.path.exists(output_file):
        output_modified = datetime.fromtimestamp(os.path.getmtime(output_file))
    
    needs_update = (
        data_modified is not None and 
        (output_modified is None or data_modified > output_modified)
    )
    
    return {
        'data_file': csv_path,
        'data_modified': data_modified.isoformat() if data_modified else None,
        'output_file': output_file,
        'output_modified': output_modified.isoformat() if output_modified else None,
        'needs_update': needs_update
    }

def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description='Customer Segmentation Pipeline Runner')
    parser.add_argument('--source', choices=['csv', 'mongodb'], default='csv',
                      help='Data source (default: csv)')
    parser.add_argument('--csv-path', type=str,
                      help='Path to CSV file (default: db/purchase_records.csv)')
    parser.add_argument('--output-dir', type=str, 
                      default='/Users/admin/PycharmProjects/PythonProject/output',
                      help='Output directory')
    parser.add_argument('--check-freshness', action='store_true',
                      help='Check if data needs updating')
    parser.add_argument('--force', action='store_true',
                      help='Force run even if data is up to date')
    
    args = parser.parse_args()
    
    try:
        # Check freshness if requested
        if args.check_freshness:
            freshness = check_data_freshness(args.csv_path)
            print(json.dumps(freshness, indent=2))
            
            if not args.force and not freshness['needs_update']:
                logger.info("Data is up to date, skipping segmentation")
                return
        
        # Prepare configuration
        config = {
            'output_dir': args.output_dir,
            'output_filename': 'customer_segmentation.json'
        }
        
        # Run segmentation
        result = run_segmentation(
            source=args.source,
            csv_path=args.csv_path,
            config=config
        )
        
        # Log the run
        save_run_log(result)
        
        # Print summary
        print(f"Segmentation completed successfully!")
        print(f"Processed {result['metadata']['total_customers']} customers")
        print(f"Output saved to: {result['output_file']}")
        
    except Exception as e:
        logger.error(f"Segmentation failed: {e}")
        raise

if __name__ == "__main__":
    main()