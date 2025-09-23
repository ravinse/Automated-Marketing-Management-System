# Customer Segmentation Pipeline Documentation

## Overview

This automated customer segmentation pipeline analyzes customer purchase behavior across three key dimensions:
- **Purchase Frequency**: New, Loyal, Lapsed, Seasonal
- **Spending Amount**: High Value, Medium Value, Low Value  
- **Category Preference**: Womens, Mens, Kids, Family

## Features

- ✅ **Multi-source data loading**: Supports both CSV files and MongoDB
- ✅ **Automated segmentation**: Applies predefined business rules
- ✅ **JSON output**: Results in specified format for API consumption
- ✅ **Data validation**: Ensures data quality and completeness
- ✅ **Comprehensive analysis**: Detailed insights and statistics
- ✅ **Automation ready**: Can be scheduled or triggered by data changes

## Quick Start

### 1. Basic Usage

```python
from ml.run_segmentation import run_segmentation

# Run segmentation from CSV
result = run_segmentation(
    source='csv',
    csv_path='db/purchase_records.csv'
)

print(f"Processed {result['metadata']['total_customers']} customers")
print(f"Output: {result['output_file']}")
```

### 2. Command Line Usage

```bash
# Run segmentation with default settings
python ml/run_segmentation.py

# Check if data needs updating
python ml/run_segmentation.py --check-freshness

# Force run even if data is current
python ml/run_segmentation.py --force

# Specify custom CSV file
python ml/run_segmentation.py --csv-path /path/to/data.csv

# Use MongoDB source
python ml/run_segmentation.py --source mongodb
```

## Data Requirements

### Input Data Format

The pipeline expects data with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| customer_id | Unique customer identifier | CUST1234 |
| purchase_id | Unique purchase/order ID | ORD5678 |
| purchase_date | Date of purchase | 2024-01-15 |
| amount | Purchase amount | 15000 |
| category | Product category | Womens, Mens, Kids |

### CSV Format
```csv
Customer_ID,Order_ID,Date,Total_Amount_LKR,Product_Category
CUST1234,ORD5678,2024-01-15,15000,Womens
```

### MongoDB Format
```json
{
  "customer": {"id": "CUST1234", "name": "John Doe"},
  "order_id": "ORD5678", 
  "date": "2024-01-15",
  "total_amount_lkr": 15000,
  "product": {"category": "Womens"}
}
```

## Segmentation Rules

### A. Purchase Frequency

| Segment | Rule |
|---------|------|
| **New** | Only 1 purchase (first-time buyer) |
| **Loyal** | 5+ purchases in last 6 months |
| **Lapsed** | No purchases in last 90 days |
| **Seasonal** | 80%+ purchases during festive periods |

### B. Spending Amount

| Segment | Rule |
|---------|------|
| **High Value** | AOV ≥ 15,000 OR Lifetime ≥ 150,000 |
| **Low Value** | Lifetime spending ≤ 10,000 |
| **Medium Value** | Everyone else in between |

### C. Category Preference

| Segment | Rule |
|---------|------|
| **Womens** | ≥70% purchases in women's clothing |
| **Mens** | ≥70% purchases in men's clothing |
| **Kids** | ≥70% purchases in kids' clothing |
| **Family** | ≥30% in multiple categories |

## Output Format

### JSON Structure
```json
[
  {
    "customer_id": "CUST1234",
    "segmentation": {
      "purchase_frequency": "Loyal",
      "spending": "High Value",
      "category": "Womens"
    }
  }
]
```

### Output Files

| File | Description |
|------|-------------|
| `customer_segmentation.json` | Main segmentation results |
| `segmentation_runs.log` | Processing logs |
| `automation_status.json` | Automation status (if using automation) |

## Advanced Configuration

### Custom Configuration

```python
config = {
    'output_dir': '/custom/output/path',
    'output_filename': 'my_segments.json',
    'high_aov_threshold': 20000,      # Custom AOV threshold
    'high_lifetime_threshold': 200000, # Custom lifetime threshold
    'low_lifetime_threshold': 5000,   # Custom low value threshold
    'dominant_threshold': 0.8,        # Custom category dominance
    'family_threshold': 0.25          # Custom family threshold
}

pipeline = CustomerSegmentationPipeline(config)
```

### MongoDB Configuration

```python
config = {
    'mongodb': {
        'username': 'your_username',
        'password': 'your_password', 
        'database': 'your_database',
        'collection': 'purchases'
    }
}
```

## Automation Setup

### Option 1: Cron Jobs (Recommended)

Add to crontab for scheduled runs:

```bash
# Run every 6 hours
0 */6 * * * cd /path/to/project && python ml/run_segmentation.py --check-freshness

# Run daily at 2 AM
0 2 * * * cd /path/to/project && python ml/run_segmentation.py --force
```

### Option 2: File Monitoring

For real-time updates when data changes:

```bash
# Install required packages first
pip install schedule watchdog

# Run the automation script
python ml/automation.py
```

## API Integration

### Reading Results

```python
import json

# Load segmentation results
with open('output/customer_segmentation.json', 'r') as f:
    segments = json.load(f)

# Find customer segment
def get_customer_segment(customer_id):
    for customer in segments:
        if customer['customer_id'] == customer_id:
            return customer['segmentation']
    return None

# Example usage
segment = get_customer_segment('CUST1234')
print(f"Customer is: {segment['spending']} + {segment['category']}")
```

### REST API Example

```python
from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route('/segments/<customer_id>')
def get_customer_segment(customer_id):
    with open('output/customer_segmentation.json', 'r') as f:
        segments = json.load(f)
    
    for customer in segments:
        if customer['customer_id'] == customer_id:
            return jsonify(customer)
    
    return jsonify({'error': 'Customer not found'}), 404

@app.route('/segments/stats')
def get_segment_stats():
    # Return segment distribution statistics
    pass
```

## Performance & Scaling

### Processing Times

| Dataset Size | Processing Time | Memory Usage |
|--------------|----------------|--------------|
| 10K records | ~0.1 seconds | ~50MB |
| 100K records | ~1 second | ~200MB |
| 1M records | ~10 seconds | ~1GB |

### Optimization Tips

1. **Index your data**: Ensure customer_id and date columns are indexed
2. **Batch processing**: For very large datasets, process in chunks
3. **Incremental updates**: Only process new/changed customers
4. **Caching**: Cache intermediate results for faster re-runs

## Troubleshooting

### Common Issues

**1. "No data found" error**
- Check file path exists
- Verify data format matches expected columns
- Ensure MongoDB connection details are correct

**2. "Missing required columns" warning**
- Map your column names to expected format
- Use DataLoader column mapping feature

**3. Performance issues**
- Reduce data size or add more memory
- Use CSV instead of MongoDB for large datasets
- Enable incremental processing

**4. Incorrect segmentation results**
- Verify date ranges and thresholds
- Check data quality (missing dates, negative amounts)
- Review business rules for your context

### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Run with detailed logging
result = run_segmentation(source='csv', csv_path='data.csv')
```

## Extension & Customization

### Adding New Segments

1. Create new segmenter class inheriting from base segmenter
2. Implement `segment_customers()` method
3. Add to main pipeline in `customer_segmentation_pipeline.py`

### Custom Business Rules

```python
class CustomFrequencySegmenter(PurchaseFrequencySegmenter):
    def _classify_customer(self, row) -> str:
        # Custom logic here
        if row['total_purchases'] >= 10:
            return "VIP"
        return super()._classify_customer(row)
```

### Industry-Specific Modifications

- **Fashion Retail**: Add seasonal trends, size preferences
- **E-commerce**: Include digital behavior, channel preferences  
- **B2B**: Add company size, industry segments
- **Subscription**: Add churn prediction, upgrade potential

## Support & Maintenance

### Monitoring

- Check segmentation runs logs regularly
- Monitor data freshness and quality
- Review segment distributions for anomalies
- Set up alerts for processing failures

### Updates

- Review and update business rules quarterly
- Adjust thresholds based on business changes
- Add new data sources as available
- Optimize performance for growing datasets

### Backup & Recovery

- Backup output files regularly
- Version control your configuration
- Document any custom modifications
- Test disaster recovery procedures

## Contact & Support

For questions, issues, or feature requests:
- Check logs in `output/segmentation_runs.log`
- Review this documentation
- Test with smaller datasets first
- Contact system administrator for access issues