#!/bin/bash

# Customer Segmentation API Test Script
# This script tests all the segmentation endpoints

API_URL="http://localhost:5001/api"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}================================${NC}"
echo -e "${BOLD}${BLUE}Customer Segmentation API Tests${NC}"
echo -e "${BOLD}${BLUE}================================${NC}\n"

# Test 1: Get Segmentation Stats
echo -e "${BOLD}Test 1: Get Segmentation Statistics${NC}"
echo -e "GET ${API_URL}/segmentation/stats"
curl -s "${API_URL}/segmentation/stats" | json_pp
echo -e "\n"

# Test 2: Get Available Segments
echo -e "${BOLD}Test 2: Get Available Segments${NC}"
echo -e "GET ${API_URL}/segmentation/available-segments"
curl -s "${API_URL}/segmentation/available-segments" | json_pp
echo -e "\n"

# Test 3: Preview Count for Single Segment
echo -e "${BOLD}Test 3: Preview Count - New Customers${NC}"
echo -e "POST ${API_URL}/segmentation/preview-count"
curl -s -X POST "${API_URL}/segmentation/preview-count" \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers"]}' | json_pp
echo -e "\n"

# Test 4: Preview Count for Multiple Segments (Same Filter)
echo -e "${BOLD}Test 4: Preview Count - New + Loyal Customers${NC}"
echo -e "POST ${API_URL}/segmentation/preview-count"
curl -s -X POST "${API_URL}/segmentation/preview-count" \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers", "Loyal Customers"]}' | json_pp
echo -e "\n"

# Test 5: Preview Count for Multiple Filters (Intersection)
echo -e "${BOLD}Test 5: Preview Count - New Customers + High Value${NC}"
echo -e "POST ${API_URL}/segmentation/preview-count"
curl -s -X POST "${API_URL}/segmentation/preview-count" \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers", "High value customers"]}' | json_pp
echo -e "\n"

# Test 6: Get Filtered Customers (Limited)
echo -e "${BOLD}Test 6: Get Filtered Customers - Women${NC}"
echo -e "POST ${API_URL}/segmentation/filtered-customers"
echo -e "(Showing first 5 customers only)\n"
curl -s -X POST "${API_URL}/segmentation/filtered-customers" \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["Women"]}' | \
  json_pp | head -100
echo -e "\n"

# Test 7: Complex Multi-Filter Query
echo -e "${BOLD}Test 7: Complex Query - New + High Value + Women${NC}"
echo -e "POST ${API_URL}/segmentation/preview-count"
curl -s -X POST "${API_URL}/segmentation/preview-count" \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers", "High value customers", "Women"]}' | json_pp
echo -e "\n"

# Test 8: Get Customers by IDs
echo -e "${BOLD}Test 8: Get Customers by IDs${NC}"
echo -e "POST ${API_URL}/segmentation/customers-by-ids"
curl -s -X POST "${API_URL}/segmentation/customers-by-ids" \
  -H "Content-Type: application/json" \
  -d '{"customerIds": ["CUST0001", "CUST0002", "CUST0003"]}' | json_pp
echo -e "\n"

echo -e "${BOLD}${GREEN}================================${NC}"
echo -e "${BOLD}${GREEN}All Tests Completed!${NC}"
echo -e "${BOLD}${GREEN}================================${NC}\n"

echo -e "${BOLD}Notes:${NC}"
echo -e "- Ensure backend server is running on port 5001"
echo -e "- Verify MongoDB connection is established"
echo -e "- Check that customer segmentation data is uploaded"
echo -e ""
