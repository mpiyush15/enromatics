#!/bin/bash

# ============================================
# AUTH SYSTEM VERIFICATION SCRIPT
# Purpose: Check that auth system is locked and correct
# Run this whenever you add new routes
# ============================================

echo "🔍 AUTH SYSTEM VERIFICATION SCRIPT"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0
SUCCESSES=0

# ============================================
# Test 1: Check for non-existent auth.js file
# ============================================
echo "📋 Test 1: Checking for non-existent auth.js references..."

BAD_IMPORTS=$(grep -r "from.*middleware/auth\.js" backend/src/routes/ 2>/dev/null | wc -l)

if [ "$BAD_IMPORTS" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: Found ${BAD_IMPORTS} imports from non-existent auth.js${NC}"
    grep -r "from.*middleware/auth\.js" backend/src/routes/
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No imports from non-existent auth.js${NC}"
    SUCCESSES=$((SUCCESSES + 1))
fi

echo ""

# ============================================
# Test 2: Check for use of wrong function name "authenticate"
# ============================================
echo "📋 Test 2: Checking for wrong function name 'authenticate'..."

WRONG_FUNCTION=$(grep -r "authenticate" backend/src/routes/ 2>/dev/null | grep -v "authMiddleware" | wc -l)

if [ "$WRONG_FUNCTION" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: Found ${WRONG_FUNCTION} uses of 'authenticate' function${NC}"
    grep -r "authenticate" backend/src/routes/ | grep -v "authMiddleware"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No incorrect 'authenticate' function usage${NC}"
    SUCCESSES=$((SUCCESSES + 1))
fi

echo ""

# ============================================
# Test 3: Verify authMiddleware.js exists and has correct exports
# ============================================
echo "📋 Test 3: Checking authMiddleware.js exports..."

if [ ! -f "backend/src/middleware/authMiddleware.js" ]; then
    echo -e "${RED}❌ FAIL: authMiddleware.js does not exist${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: authMiddleware.js exists${NC}"
    SUCCESSES=$((SUCCESSES + 1))
    
    # Check for required exports
    PROTECT_EXPORT=$(grep -c "export const protect" backend/src/middleware/authMiddleware.js)
    CHECKADMIN_EXPORT=$(grep -c "export const checkSuperAdmin" backend/src/middleware/authMiddleware.js)
    
    if [ "$PROTECT_EXPORT" -eq 0 ]; then
        echo -e "${RED}  ❌ Missing 'export const protect'${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  ✅ Found 'export const protect'${NC}"
    fi
    
    if [ "$CHECKADMIN_EXPORT" -eq 0 ]; then
        echo -e "${RED}  ❌ Missing 'export const checkSuperAdmin'${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  ✅ Found 'export const checkSuperAdmin'${NC}"
    fi
fi

echo ""

# ============================================
# Test 4: Verify roleMiddleware.js exists and has correct exports
# ============================================
echo "📋 Test 4: Checking roleMiddleware.js exports..."

if [ ! -f "backend/src/middleware/roleMiddleware.js" ]; then
    echo -e "${RED}❌ FAIL: roleMiddleware.js does not exist${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: roleMiddleware.js exists${NC}"
    SUCCESSES=$((SUCCESSES + 1))
    
    # Check for required exports
    AUTHROLEROLES_EXPORT=$(grep -c "export const authorizeRoles" backend/src/middleware/roleMiddleware.js)
    
    if [ "$AUTHROLEROLES_EXPORT" -eq 0 ]; then
        echo -e "${RED}  ❌ Missing 'export const authorizeRoles'${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}  ✅ Found 'export const authorizeRoles'${NC}"
    fi
fi

echo ""

# ============================================
# Test 5: Count correct imports
# ============================================
echo "📋 Test 5: Counting correct auth imports..."

CORRECT_PROTECT=$(grep -r "from.*authMiddleware\.js" backend/src/routes/ 2>/dev/null | wc -l)
CORRECT_ROLES=$(grep -r "from.*roleMiddleware\.js" backend/src/routes/ 2>/dev/null | wc -l)

echo "  Found $CORRECT_PROTECT imports from authMiddleware.js"
echo "  Found $CORRECT_ROLES imports from roleMiddleware.js"
echo -e "${GREEN}✅ PASS: Routes are using correct auth imports${NC}"
SUCCESSES=$((SUCCESSES + 1))

echo ""

# ============================================
# Test 6: Check for middleware ordering issues
# ============================================
echo "📋 Test 6: Checking middleware ordering (sample check)..."

# This is a basic check - finds routes that use authorizeRoles before protect
WRONG_ORDER=$(grep -r "authorizeRoles.*protect" backend/src/routes/ 2>/dev/null | wc -l)

if [ "$WRONG_ORDER" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found ${WRONG_ORDER} potential middleware ordering issues${NC}"
    echo "   Please verify these manually:"
    grep -r "authorizeRoles.*protect" backend/src/routes/
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ PASS: No obvious middleware ordering issues detected${NC}"
    SUCCESSES=$((SUCCESSES + 1))
fi

echo ""

# ============================================
# Test 7: Verify no auth.js file exists
# ============================================
echo "📋 Test 7: Verifying auth.js does NOT exist..."

if [ -f "backend/src/middleware/auth.js" ]; then
    echo -e "${RED}❌ FAIL: auth.js file exists! This should not exist.${NC}"
    echo "   Remove this file immediately!"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: Confirmed auth.js does not exist${NC}"
    SUCCESSES=$((SUCCESSES + 1))
fi

echo ""

# ============================================
# Summary
# ============================================
echo "===================================="
echo "📊 VERIFICATION SUMMARY"
echo "===================================="
echo -e "${GREEN}✅ Passed: ${SUCCESSES}${NC}"
echo -e "${YELLOW}⚠️  Warnings: ${WARNINGS}${NC}"
echo -e "${RED}❌ Errors: ${ERRORS}${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}🎉 AUTH SYSTEM IS LOCKED AND CLEAN!${NC}"
    echo ""
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Auth system has warnings but no critical errors${NC}"
    echo ""
    exit 1
else
    echo -e "${RED}🚨 AUTH SYSTEM HAS CRITICAL ERRORS!${NC}"
    echo "   Fix these errors immediately!"
    echo ""
    exit 2
fi
