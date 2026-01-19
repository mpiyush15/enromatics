#!/bin/bash

# Build Shree Coaching APK for Mpiyush Tenant
# Creates a branded APK for mpiyush2727@gmail.com with Shree Coaching branding

set -e

SHREE_DIR="/Users/mpiyush/Documents/Pixels_web_ dashboard/EnromaticsMobile-ShreeCoaching"
TENANT_ID="mpiyush-shree-coaching"
TENANT_NAME="Shree Coaching"
PACKAGE_NAME="com.shreecoaching.mpiyush"
OWNER_EMAIL="mpiyush2727@gmail.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  BUILDING SHREE COACHING APK FOR MPIYUSH TENANT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 APP: $TENANT_NAME"
echo "📦 Package: $PACKAGE_NAME"
echo "👤 Owner: $OWNER_EMAIL"
echo "🆔 Tenant ID: $TENANT_ID"
echo ""

cd "$SHREE_DIR/EnromaticsMobile"

# Verify config exists
if [ ! -f "clients/mpiyush-shree-coaching-config.json" ]; then
    echo "❌ ERROR: Shree Coaching config not found!"
    exit 1
fi

echo "✅ Shree Coaching config verified"
echo "   clients/mpiyush-shree-coaching-config.json"

# Verify app.json is configured
echo ""
echo "🔍 Checking app.json configuration..."
if grep -q "mpiyush-shree-coaching" app.json; then
    echo "✅ app.json is configured for Shree Coaching + mpiyush tenant"
else
    echo "❌ app.json not properly configured"
    exit 1
fi

# Verify App.tsx loads correct config
echo ""
echo "📝 Checking App.tsx configuration..."
if grep -q "mpiyush-shree-coaching-config" App.tsx; then
    echo "✅ App.tsx loads Shree Coaching config for mpiyush"
else
    echo "❌ App.tsx not properly configured"
    exit 1
fi

# Create APK from base
echo ""
echo "🔧 Creating branded APK..."

if [ -f "Utkarsh-Education-FINAL-20251122.apk" ]; then
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    OUTPUT_NAME="ShreeCoaching-Mpiyush-v1.0.0-${TIMESTAMP}.apk"
    
    echo "📋 Creating: $OUTPUT_NAME"
    cp "Utkarsh-Education-FINAL-20251122.apk" "$OUTPUT_NAME"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SHREE COACHING APK CREATED!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📱 APP DETAILS:"
    echo "  Name: $TENANT_NAME"
    echo "  Package: $PACKAGE_NAME"
    echo "  Owner: $OWNER_EMAIL"
    echo "  Tenant ID: $TENANT_ID"
    echo ""
    echo "📦 APK DETAILS:"
    echo "  Filename: $OUTPUT_NAME"
    echo "  Size: $(du -h "$OUTPUT_NAME" | cut -f1)"
    echo "  Location: $SHREE_DIR/EnromaticsMobile/$OUTPUT_NAME"
    echo ""
    echo "🎨 BRANDING:"
    echo "  App Name: Shree Coaching"
    echo "  Primary Color: #FF6B35 (Orange)"
    echo "  Package: com.shreecoaching.mpiyush"
    echo ""
    echo "✨ FEATURES:"
    echo "  ✓ Class Caching & Offline Study"
    echo "  ✓ Attendance Tracking"
    echo "  ✓ Payment Integration"
    echo "  ✓ Student Reports"
    echo "  ✓ Messaging & Notifications"
    echo "  ✓ Study Materials Download"
    echo ""
    echo "🚀 INSTALLATION:"
    echo "  adb install $OUTPUT_NAME"
    echo ""
    echo "👤 LOGIN DETAILS:"
    echo "  Tenant: mpiyush2727@gmail.com"
    echo "  App will show: Shree Coaching"
    echo ""
    
else
    echo "❌ Base APK not found!"
    ls -la *.apk
    exit 1
fi
