#!/bin/bash

# Script to update all BFF routes with buildBFFHeaders() support
# This adds subdomain header support to all API routes

echo "🔧 Starting BFF Routes Update for Subdomain Support"
echo "=================================================="

ROUTES_DIR="/Users/mpiyush/Documents/Pixels_web_ dashboard/frontend/app/api"
UPDATED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# Find all route.ts files
while IFS= read -r file; do
  echo ""
  echo "📝 Processing: $file"
  
  # Skip if already uses buildBFFHeaders
  if grep -q "buildBFFHeaders" "$file"; then
    echo "   ⏭️  Already updated (contains buildBFFHeaders)"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Skip if doesn't make fetch calls
  if ! grep -q "fetch(" "$file"; then
    echo "   ⏭️  No fetch calls (not a proxy route)"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Skip auth routes (they're public)
  if [[ "$file" == *"/auth/"* ]]; then
    echo "   ⏭️  Auth route (public, no subdomain needed)"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Skip public routes
  if [[ "$file" == *"/public/"* ]]; then
    echo "   ⏭️  Public route (no subdomain needed)"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Backup original file
  cp "$file" "$file.backup"
  
  # Check if file has imports section
  if ! grep -q "^import" "$file"; then
    echo "   ⚠️  No imports section found"
    rm "$file.backup"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Add import at the top (after other imports)
  if grep -q 'import.*NextRequest.*NextResponse' "$file"; then
    # Add after Next.js imports
    sed -i '' '/import.*NextRequest.*NextResponse/a\
import { buildBFFHeaders } from "@/lib/bffHelpers";
' "$file"
  else
    # Add at the beginning
    sed -i '' '1i\
import { buildBFFHeaders } from "@/lib/bffHelpers";\

' "$file"
  fi
  
  # Replace header patterns
  # Pattern 1: headers: { "Content-Type": "application/json", Cookie: cookieHeader }
  sed -i '' 's/headers: {[[:space:]]*"Content-Type": "application\/json",[[:space:]]*Cookie: cookieHeader[[:space:]]*}/headers: await buildBFFHeaders()/g' "$file"
  
  # Pattern 2: headers: { "Content-Type": "application/json" }
  sed -i '' 's/headers: {[[:space:]]*"Content-Type": "application\/json"[[:space:]]*}/headers: await buildBFFHeaders()/g' "$file"
  
  # Pattern 3: Cookie: cookieHeader in headers
  sed -i '' 's/Cookie: cookieHeader,/\/\/ Cookie forwarded by buildBFFHeaders()/g' "$file"
  
  # Check if changes were made
  if diff -q "$file" "$file.backup" > /dev/null; then
    echo "   ⚠️  No changes made (pattern not found)"
    mv "$file.backup" "$file"
    ((SKIPPED_COUNT++))
  else
    echo "   ✅ Updated successfully"
    rm "$file.backup"
    ((UPDATED_COUNT++))
  fi
  
done < <(find "$ROUTES_DIR" -name "route.ts" -type f)

echo ""
echo "=================================================="
echo "📊 Summary:"
echo "   ✅ Updated: $UPDATED_COUNT routes"
echo "   ⏭️  Skipped: $SKIPPED_COUNT routes"
echo "   ❌ Errors: $ERROR_COUNT routes"
echo "=================================================="
