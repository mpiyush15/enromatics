#!/bin/bash

echo "🔍 Testing Instagram Graph API Access..."
echo "App ID: 1193384345994095"
echo ""
echo "⚠️  This test requires a VALID Facebook access token with page permissions"
echo ""
echo "If you have an access token, run:"
echo ""
echo "curl -X GET \\"
echo "  'https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=YOUR_TOKEN_HERE'"
echo ""
echo "---"
echo ""
echo "Expected Response if Instagram API is enabled:"
echo "{"
echo '  "data": ['
echo "    {"
echo '      "id": "123456789",'
echo '      "name": "Your Page Name",'
echo '      "instagram_business_account": {'
echo '        "id": "987654321"'
echo "      }"
echo "    }"
echo "  ]"
echo "}"
echo ""
echo "---"
echo ""
echo "What this tells us:"
echo "✅ If you see instagram_business_account ID → API is ENABLED"
echo "❌ If instagram_business_account is MISSING → API is NOT ENABLED or page has no Instagram"
echo "❌ If you get error about permissions → Instagram API not added to app"
echo ""
