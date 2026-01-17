#!/bin/bash

# Payment Link Feature - Quick Test Script
# Run this to verify all fixes are working

echo "════════════════════════════════════════════════════════════"
echo "  Payment Link Feature - Testing Suite"
echo "════════════════════════════════════════════════════════════"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 TEST CHECKLIST${NC}\n"

# Test 1: Backend running
echo -e "${YELLOW}1️⃣  Checking if Backend is running...${NC}"
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5000${NC}\n"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    echo -e "${YELLOW}   Fix: Run 'npm run dev' in the backend folder${NC}\n"
fi

# Test 2: Frontend running
echo -e "${YELLOW}2️⃣  Checking if Frontend is running...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}\n"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
    echo -e "${YELLOW}   Fix: Run 'npm run dev' in the frontend folder${NC}\n"
fi

# Test 3: Plans endpoint
echo -e "${YELLOW}3️⃣  Testing Plans Endpoint (/api/payment-links/plans)...${NC}"
PLANS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/payment-links/plans)

if [ "$PLANS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Plans endpoint is working (Status: 200)${NC}"
    echo -e "${BLUE}   Response sample:${NC}"
    curl -s http://localhost:5000/api/payment-links/plans | head -c 200
    echo -e "\n${NC}"
elif [ "$PLANS_RESPONSE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Plans endpoint requires authentication (Status: 401)${NC}"
    echo -e "${YELLOW}   This is normal - requires SuperAdmin login${NC}\n"
else
    echo -e "${RED}❌ Plans endpoint error (Status: $PLANS_RESPONSE)${NC}\n"
fi

# Test 4: Run detailed plans test
echo -e "${YELLOW}4️⃣  Running detailed plans test...${NC}"
if [ -f "test-payment-plans.mjs" ]; then
    echo -e "${BLUE}   Running: node test-payment-plans.mjs${NC}\n"
    node test-payment-plans.mjs
    echo ""
else
    echo -e "${RED}❌ test-payment-plans.mjs not found${NC}\n"
fi

# Summary
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                       NEXT STEPS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}If all tests passed:${NC}"
echo "  1. Open browser: http://localhost:3000"
echo "  2. Login as SuperAdmin"
echo "  3. Go to: /dashboard/tenants/[tenantId]"
echo "  4. Scroll to 💳 Payment Link card"
echo "  5. Should see plan dropdown with available plans"
echo ""

echo -e "${YELLOW}If tests failed:${NC}"
echo "  1. Check server logs in terminal"
echo "  2. Open browser DevTools (F12) → Console"
echo "  3. Look for error messages"
echo "  4. Read: DEBUGGING_PAYMENT_LINK_ISSUES.md"
echo ""

echo -e "${YELLOW}Key files to check:${NC}"
echo "  • FIXES_APPLIED_SUMMARY.md"
echo "  • DEBUGGING_PAYMENT_LINK_ISSUES.md"
echo "  • DOCS/PAYMENT_LINK_GENERATION_COMPLETE.md"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"
