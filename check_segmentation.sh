#!/bin/bash

echo "🔍 Quick Diagnostic Check for Customer Segmentation Feature"
echo "==========================================================="
echo ""

# Check if backend is running
echo -n "1. Backend Server: "
if curl -s http://localhost:5001/ > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ NOT RUNNING - Start with: cd backend && npm start"
    exit 1
fi

# Check if segmentation API is loaded
echo -n "2. Segmentation API: "
if curl -s http://localhost:5001/api/segmentation/stats 2>&1 | grep -q "success"; then
    echo "✅ Loaded"
else
    echo "❌ NOT LOADED - RESTART BACKEND SERVER"
    echo "   Run: cd backend && npm start"
    exit 1
fi

# Check if MongoDB is connected and has data
echo -n "3. Customer Data: "
RESULT=$(curl -s http://localhost:5001/api/segmentation/stats 2>&1)
if echo "$RESULT" | grep -q "totalCustomers"; then
    COUNT=$(echo "$RESULT" | grep -o '"totalCustomers":[0-9]*' | grep -o '[0-9]*')
    if [ "$COUNT" -gt 0 ]; then
        echo "✅ Found $COUNT customers"
    else
        echo "❌ No customers in database"
        echo "   Upload data with: cd ml && python clean_posdata.py ..."
        exit 1
    fi
else
    echo "❌ Cannot read data - Check MongoDB connection"
    exit 1
fi

# Test filtering
echo -n "4. Filtering Logic: "
FILTER_RESULT=$(curl -s -X POST http://localhost:5001/api/segmentation/preview-count \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers"]}' 2>&1)
  
if echo "$FILTER_RESULT" | grep -q "count"; then
    FILTER_COUNT=$(echo "$FILTER_RESULT" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' | head -1)
    echo "✅ Working (found $FILTER_COUNT new customers)"
else
    echo "❌ Filter test failed"
    exit 1
fi

echo ""
echo "==========================================================="
echo "✅ ALL CHECKS PASSED!"
echo "==========================================================="
echo ""
echo "The customer segmentation feature is ready to use."
echo "Go to Campaign Creation and select customer segments."
echo ""
