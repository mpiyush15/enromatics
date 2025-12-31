#!/bin/bash

# Test webhook trigger
echo "🧪 Testing WhatsApp Webhook Trigger"
echo ""

# Simulate a webhook payload
PAYLOAD='{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "PHONE_NUMBER_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+918087131777",
              "phone_number_id": "889344924259692"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test User"
                },
                "wa_id": "918087131777"
              }
            ],
            "messages": [
              {
                "from": "918087131777",
                "id": "wamid.test123",
                "timestamp": "'$(date +%s)'",
                "type": "text",
                "text": {
                  "body": "admissions"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}'

echo "📤 Sending test webhook payload:"
echo ""
echo "$PAYLOAD" | jq '.'
echo ""
echo "🔗 Posting to: http://localhost:5050/api/whatsapp/webhook"
echo ""

curl -X POST "http://localhost:5050/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -v

echo ""
echo "✅ Test complete!"
