"""
Automation script for customer segmentation pipeline.
Monitors data sources and automatically re-runs segmentation when new data is detected.
"""

import os
import time
import schedule
import threading
from datetime import datetime
from typing import Dict, Any, Optional
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import json

from customer_segmentation_pipeline import CustomerSegmentationPipeline

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataChangeHandler(FileSystemEventHandler):
    """Handles file system events for automatic segmentation triggering."""
    
    def __init__(self, automation_manager):
        self.automation_manager = automation_manager
        self.last_triggered = {}
        self.debounce_seconds = 30  # Prevent multiple triggers within 30 seconds
        
    def on_modified(self, event):
        """Handle file modification events."""
        if not event.is_directory:
            file_path = event.src_path
            
            # Check if it's a CSV file we're monitoring
            if file_path.endswith('.csv') and 'purchase' in file_path.lower():
                current_time = time.time()
                last_time = self.last_triggered.get(file_path, 0)
                
                if current_time - last_time > self.debounce_seconds:
                    logger.info(f"Data file modified: {file_path}")
                    self.automation_manager.trigger_segmentation('file_change', file_path)
                    self.last_triggered[file_path] = current_time

class SegmentationAutomation:
    """Main automation class for customer segmentation."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the automation system.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or self._load_default_config()
        self.pipeline = CustomerSegmentationPipeline(self.config)
        self.observer = None
        self.running = False
        
        # Automation settings
        self.csv_watch_paths = self.config.get('csv_watch_paths', [
            '/Users/admin/PycharmProjects/PythonProject/db/purchase_records.csv'
        ])
        self.schedule_enabled = self.config.get('schedule_enabled', True)
        self.schedule_interval_hours = self.config.get('schedule_interval_hours', 6)
        
        # Status tracking
        self.status_file = os.path.join(
            self.pipeline.output_dir, 'automation_status.json'
        )
        self.last_run_info = self._load_status()
        
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration."""
        return {
            'output_dir': '/Users/admin/PycharmProjects/PythonProject/output',
            'output_filename': 'customer_segmentation.json',
            'csv_watch_paths': [
                '/Users/admin/PycharmProjects/PythonProject/db/purchase_records.csv'
            ],
            'schedule_enabled': True,
            'schedule_interval_hours': 6,
            'mongodb_enabled': False
        }
    
    def _load_status(self) -> Dict[str, Any]:
        """Load automation status from file."""
        if os.path.exists(self.status_file):
            try:
                with open(self.status_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading status file: {e}")
        
        return {
            'last_run_timestamp': None,
            'last_run_source': None,
            'last_run_status': None,
            'total_runs': 0,
            'last_error': None
        }
    
    def _save_status(self, run_info: Dict[str, Any]):
        """Save automation status to file."""
        self.last_run_info.update(run_info)
        self.last_run_info['total_runs'] = self.last_run_info.get('total_runs', 0) + 1
        
        try:
            with open(self.status_file, 'w') as f:
                json.dump(self.last_run_info, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving status file: {e}")
    
    def start_automation(self):
        """Start the automation system with file watching and scheduling."""
        logger.info("Starting customer segmentation automation")
        
        self.running = True
        
        # Start file watching
        if self.csv_watch_paths:
            self._start_file_watching()
        
        # Start scheduled runs
        if self.schedule_enabled:
            self._start_scheduled_runs()
        
        # Run initial segmentation
        self.trigger_segmentation('startup')
        
        # Keep the automation running
        try:
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Stopping automation due to user interrupt")
            self.stop_automation()
    
    def stop_automation(self):
        """Stop the automation system."""
        logger.info("Stopping customer segmentation automation")
        
        self.running = False
        
        if self.observer:
            self.observer.stop()
            self.observer.join()
    
    def _start_file_watching(self):
        """Start watching CSV files for changes."""
        logger.info("Starting file system monitoring")
        
        self.observer = Observer()
        event_handler = DataChangeHandler(self)
        
        # Watch directories containing the CSV files
        watch_dirs = set()
        for csv_path in self.csv_watch_paths:
            if os.path.exists(csv_path):
                watch_dir = os.path.dirname(csv_path)
                watch_dirs.add(watch_dir)
        
        for watch_dir in watch_dirs:
            self.observer.schedule(event_handler, watch_dir, recursive=False)
            logger.info(f"Watching directory: {watch_dir}")
        
        self.observer.start()
    
    def _start_scheduled_runs(self):
        """Start scheduled segmentation runs."""
        logger.info(f"Scheduling segmentation runs every {self.schedule_interval_hours} hours")
        
        schedule.every(self.schedule_interval_hours).hours.do(
            self.trigger_segmentation, 'scheduled'
        )
    
    def trigger_segmentation(self, trigger_type: str, file_path: str = None):
        """
        Trigger a segmentation run.
        
        Args:
            trigger_type: Type of trigger ('startup', 'scheduled', 'file_change', 'manual')
            file_path: Path to file that triggered the run (if applicable)
        """
        logger.info(f"Triggering segmentation: {trigger_type}")
        
        start_time = datetime.now()
        
        try:
            # Determine data source
            if file_path and file_path.endswith('.csv'):
                result = self.pipeline.run_segmentation_from_csv(file_path)
                source = f"CSV: {file_path}"
            elif self.config.get('mongodb_enabled'):
                result = self.pipeline.run_segmentation_from_mongodb()
                source = "MongoDB"
            else:
                # Default to first CSV file
                csv_path = self.csv_watch_paths[0] if self.csv_watch_paths else None
                if csv_path and os.path.exists(csv_path):
                    result = self.pipeline.run_segmentation_from_csv(csv_path)
                    source = f"CSV: {csv_path}"
                else:
                    raise FileNotFoundError("No valid data source found")
            
            # Save status
            run_info = {
                'last_run_timestamp': start_time.isoformat(),
                'last_run_source': source,
                'last_run_status': 'success',
                'last_run_trigger': trigger_type,
                'last_run_customers': result['metadata']['total_customers'],
                'last_run_records': result['metadata']['total_records'],
                'last_run_processing_time': result['metadata']['processing_time_seconds'],
                'last_error': None
            }
            
            self._save_status(run_info)
            
            logger.info(f"Segmentation completed successfully")
            logger.info(f"Processed {result['metadata']['total_customers']} customers")
            logger.info(f"Output saved to: {result['output_file']}")
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Segmentation failed: {error_msg}")
            
            # Save error status
            error_info = {
                'last_run_timestamp': start_time.isoformat(),
                'last_run_status': 'error',
                'last_run_trigger': trigger_type,
                'last_error': error_msg
            }
            
            self._save_status(error_info)
            
            raise
    
    def get_status(self) -> Dict[str, Any]:
        """Get current automation status."""
        return {
            'running': self.running,
            'config': self.config,
            'last_run_info': self.last_run_info,
            'watched_files': self.csv_watch_paths,
            'observer_active': self.observer is not None and self.observer.is_alive() if self.observer else False
        }
    
    def run_manual_segmentation(self, source: str = 'csv') -> Dict[str, Any]:
        """
        Manually trigger a segmentation run.
        
        Args:
            source: Data source ('csv' or 'mongodb')
            
        Returns:
            Segmentation results
        """
        return self.trigger_segmentation('manual')

def main():
    """Main function for running the automation."""
    # Load configuration (could be from file in production)
    config = {
        'output_dir': '/Users/admin/PycharmProjects/PythonProject/output',
        'output_filename': 'customer_segmentation.json',
        'csv_watch_paths': [
            '/Users/admin/PycharmProjects/PythonProject/db/purchase_records.csv'
        ],
        'schedule_enabled': True,
        'schedule_interval_hours': 6,
        'mongodb_enabled': False
    }
    
    # Create and start automation
    automation = SegmentationAutomation(config)
    
    try:
        automation.start_automation()
    except KeyboardInterrupt:
        logger.info("Automation stopped by user")
    except Exception as e:
        logger.error(f"Automation error: {e}")
    finally:
        automation.stop_automation()

if __name__ == "__main__":
    main()