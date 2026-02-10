#!/bin/bash

# Script to process feedback and store in R2
# This will enrich feedback with AI and backup to R2

set -e

WORKER_URL=${WORKER_URL:-"https://test-project.hong10054010.workers.dev"}

echo "=== Processing Feedback ==="
echo "This will process feedback with AI and backup to R2"
echo "Worker URL: $WORKER_URL"
echo ""

# Process feedback in batches
echo "Processing feedback batches..."
for i in {1..10}; do
  echo "Processing batch $i..."
  RESPONSE=$(curl -s -X POST "${WORKER_URL}/api/process" \
    -H "Content-Type: application/json" \
    -d '{"batchSize": 100}')
  
  if echo "$RESPONSE" | grep -q '"ok":true'; then
    PROCESSED=$(echo "$RESPONSE" | grep -o '"processed":[0-9]*' | grep -o '[0-9]*' || echo "0")
    echo "  ✓ Processed $PROCESSED items"
  else
    echo "  ✗ Failed: $RESPONSE"
  fi
done

echo ""
echo "=== Done ==="
