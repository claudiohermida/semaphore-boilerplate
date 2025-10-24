#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  OpenZeppelin Relayer Setup Verification"
echo "================================================"
echo ""

# Check if .env file exists
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    echo ""
    echo "Please create a .env file in the project root."
    echo "See QUICK_START.md for instructions."
    exit 1
fi

echo ""
echo "Environment Variables:"
echo "---------------------"

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

# Check each required variable
check_var() {
    local var_name=$1
    local var_value=${!var_name}

    if [ -z "$var_value" ]; then
        echo -e "${RED}✗${NC} $var_name: Not set"
        return 1
    else
        # Show first 10 chars + ... for security
        if [[ $var_name == *"KEY"* ]] || [[ $var_name == *"PRIVATE"* ]]; then
            echo -e "${GREEN}✓${NC} $var_name: Set (hidden)"
        else
            echo -e "${GREEN}✓${NC} $var_name: $var_value"
        fi
        return 0
    fi
}

# Check critical variables
critical_missing=0

check_var "NEXT_PUBLIC_OZ_RELAYER_ENDPOINT" || ((critical_missing++))
check_var "NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID" || ((critical_missing++))
check_var "OZ_RELAYER_API_KEY" || ((critical_missing++))
check_var "NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS" || ((critical_missing++))
check_var "NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS" || ((critical_missing++))
check_var "NEXT_PUBLIC_INFURA_API_KEY" || ((critical_missing++))

echo ""
echo "Optional (for fallback):"
echo "------------------------"
check_var "ETHEREUM_PRIVATE_KEY"

echo ""
echo "================================================"

if [ $critical_missing -gt 0 ]; then
    echo -e "${RED}✗ $critical_missing critical variable(s) missing${NC}"
    echo ""
    echo "Please update your .env file with the missing variables."
    exit 1
else
    echo -e "${GREEN}✓ All critical variables are set${NC}"
fi

echo ""
echo "Testing OZ Relayer Connection:"
echo "------------------------------"

# Test OZ Relayer connection
response=$(curl -s -w "\n%{http_code}" -X GET "$NEXT_PUBLIC_OZ_RELAYER_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "AUTHORIZATION: Bearer $OZ_RELAYER_API_KEY" 2>&1)

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ OZ Relayer is accessible (HTTP 200)${NC}"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✓ Setup verification complete - Ready to test!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: yarn dev"
    echo "2. Open: http://localhost:3000/debug"
    echo "3. Follow QUICK_START.md for testing"
    exit 0
elif [ "$http_code" = "000" ]; then
    echo -e "${RED}✗ Cannot connect to OZ Relayer${NC}"
    echo ""
    echo "Error: $body"
    echo ""
    echo "Possible issues:"
    echo "- OZ Relayer is not running"
    echo "- Wrong endpoint URL: $NEXT_PUBLIC_OZ_RELAYER_ENDPOINT"
    echo ""
    echo "To start OZ Relayer:"
    echo "  cd /path/to/openzeppelin-relayer"
    echo "  cargo run"
    exit 1
else
    echo -e "${RED}✗ OZ Relayer returned HTTP $http_code${NC}"
    echo ""
    echo "Response:"
    echo "$body"
    echo ""
    if [ "$http_code" = "401" ]; then
        echo "Issue: Authentication failed"
        echo "- Check that OZ_RELAYER_API_KEY matches the API_KEY in OZ Relayer config"
    elif [ "$http_code" = "404" ]; then
        echo "Issue: Endpoint not found"
        echo "- Check NEXT_PUBLIC_OZ_RELAYER_ENDPOINT is correct"
        echo "- Should be: http://localhost:8080/api/v1/relayers"
    fi
    exit 1
fi

