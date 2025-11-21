#!/bin/bash

# Mobile App Build Script for Tenant-Specific APKs
# This script builds clean APKs without backup file issues

set -e  # Exit on any error

MOBILE_DIR="/Users/mpiyush/Library/Mobile Documents/com~apple~CloudDocs/My Biz/Pixels/Pixels Projects/Pixels web dashboard/EnromaticsMobile"
TENANT_ID=${1:-"demo"}

echo "🏗️  Building mobile app APK for tenant: $TENANT_ID"

cd "$MOBILE_DIR"

# Clean any backup files first
echo "🧹 Cleaning backup files..."
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true

# Clean build directories
echo "🧹 Cleaning build directories..."
rm -rf android/app/build/ 2>/dev/null || true
rm -rf node_modules/.cache/ 2>/dev/null || true

# Update branding for tenant
echo "🎨 Updating tenant branding..."
# Update app name in strings.xml
if [ -f "android/app/src/main/res/values/strings.xml" ]; then
    sed -i.backup "s/<string name=\"app_name\">.*<\/string>/<string name=\"app_name\">Enromatics - $TENANT_ID<\/string>/" android/app/src/main/res/values/strings.xml
    rm -f android/app/src/main/res/values/strings.xml.backup
fi

# Clean Gradle cache
echo "🧹 Cleaning Gradle cache..."
cd android
./gradlew clean 2>/dev/null || echo "Gradle clean completed with warnings"

# Build APK
echo "🏗️  Building APK..."
./gradlew assembleRelease 2>/dev/null || echo "APK build completed with warnings"

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    # Copy APK with tenant-specific name
    TENANT_APK="enromatics-${TENANT_ID}-$(date +%Y%m%d).apk"
    cp "$APK_PATH" "../$TENANT_APK"
    echo "✅ APK built successfully: $TENANT_APK"
    echo "📱 APK size: $(du -h "../$TENANT_APK" | cut -f1)"
else
    echo "❌ APK build failed - file not found at $APK_PATH"
    exit 1
fi

echo "🎉 Build process completed for tenant: $TENANT_ID"