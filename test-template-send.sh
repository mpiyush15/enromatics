#!/bin/bash

# WhatsApp Template Send - Direct Backend Test
# Usage: ./test-template-send.sh <tenantId> <phone> <templateName>
# Example: ./test-template-send.sh utkarsh_education_2024 918087131777 hello_world

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:5050"
TENANT_ID="${1:-utkarsh_education_2024}"
RECIPIENT_PHONE="${2:-918087131777}"
TEMPLATE_NAME="${3:-hello_world}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  WhatsApp Template Send - Direct Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Backend URL:      $BACKEND_URL"
echo "  Tenant ID:        $TENANT_ID"
echo "  Recipient Phone:  $RECIPIENT_PHONE"
echo "  Template Name:    $TEMPLATE_NAME"
echo ""

# Step 1: Get Auth Token from localStorage (you need to provide this manually)
echo -e "${YELLOW}Step 1: Authentication${NC}"
echo "You need to provide a valid JWT token."
echo "Get it from:"
echo "  1. Open browser DevTools (F12)"
echo "  2. Go to Application → Local Storage"
echo "  3. Look for 'token' or 'jwt' key"
echo "  4. Copy the value"
echo ""

read -p "Paste your JWT token here (or press Enter to skip): " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}❌ No token provided. Cannot proceed.${NC}"
  echo ""
  echo -e "${YELLOW}To get a token:${NC}"
  echo "  1. Login to the dashboard"
  echo "  2. Open F12 → Console"
  echo "  3. Run: document.cookie.split(';').find(c => c.includes('jwt')).split('=')[1]"
  exit 1
fi

echo -e "${GREEN}✅ Token received${NC}"
echo ""

# Step 2: Send template
echo -e "${YELLOW}Step 2: Sending Template Message${NC}"
echo "Endpoint: $BACKEND_URL/api/whatsapp/send-template"
echo ""

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/whatsapp/send-template" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipientPhone\": \"$RECIPIENT_PHONE\",
    \"templateName\": \"$TEMPLATE_NAME\",
    \"templateParams\": []
  }")

echo -e "${BLUE}Response:${NC}"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Parse response
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Template sent successfully!${NC}"
  MESSAGE_ID=$(echo "$RESPONSE" | jq -r '.messageId' 2>/dev/null)
  WA_MESSAGE_ID=$(echo "$RESPONSE" | jq -r '.waMessageId' 2>/dev/null)
  echo "  Message ID: $MESSAGE_ID"
  echo "  WhatsApp ID: $WA_MESSAGE_ID"
elif echo "$RESPONSE" | grep -q '"success":false'; then
  echo -e "${RED}❌ Send failed${NC}"
  ERROR=$(echo "$RESPONSE" | jq -r '.message' 2>/dev/null)
  echo "  Error: $ERROR"
else
  echo -e "${RED}❌ Unexpected response${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Check backend logs for 'SENDING TEMPLATE MESSAGE'"
echo "  2. Look for any error logs"
echo "  3. If successful, check your WhatsApp for the message"
echo "  4. If failed, see WHATSAPP_TEMPLATE_SEND_DEBUG.md for error codes"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
