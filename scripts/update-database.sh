#!/bin/bash

# Script to update database schema and generate seed data
# Usage: ./scripts/update-database.sh

set -e

echo "=== Database Update Script ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the worker URL from wrangler.toml or use default
WORKER_URL=${WORKER_URL:-"http://localhost:8787"}

echo -e "${YELLOW}Step 1: Running database migration...${NC}"
echo "This will add new columns (user_name, rating, category, tags, verified) to raw_feedback table"
echo ""

# Run migration
MIGRATE_RESPONSE=$(curl -s -X POST "${WORKER_URL}/api/migrate" \
  -H "Content-Type: application/json" || echo '{"ok":false,"error":"Failed to connect"}')

if echo "$MIGRATE_RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Migration completed successfully${NC}"
  echo "$MIGRATE_RESPONSE" | jq '.' 2>/dev/null || echo "$MIGRATE_RESPONSE"
else
  echo -e "${RED}✗ Migration failed${NC}"
  echo "$MIGRATE_RESPONSE" | jq '.' 2>/dev/null || echo "$MIGRATE_RESPONSE"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Generating seed data...${NC}"
echo "This will generate 2000 feedback items with the new format"
echo ""

# Generate seed data
SEED_RESPONSE=$(curl -s -X POST "${WORKER_URL}/api/seed" \
  -H "Content-Type: application/json" || echo '{"ok":false,"error":"Failed to connect"}')

if echo "$SEED_RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Seed data generated successfully${NC}"
  echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
else
  echo -e "${RED}✗ Seed data generation failed${NC}"
  echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
  exit 1
fi

echo ""
echo -e "${GREEN}=== All done! ===${NC}"
echo "Your database has been updated and populated with new seed data."
