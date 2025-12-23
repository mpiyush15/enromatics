#!/usr/bin/env python3
"""
BFF Routes Updater for Subdomain Support
Automatically adds buildBFFHeaders() to all BFF routes
"""

import os
import re
from pathlib import Path

ROUTES_DIR = Path("/Users/mpiyush/Documents/Pixels_web_ dashboard/frontend/app/api")
DRY_RUN = False  # Set to True to preview changes without modifying files

updated_count = 0
skipped_count = 0
error_count = 0

def should_skip_file(filepath):
    """Check if file should be skipped"""
    path_str = str(filepath)
    
    # Skip auth routes (public)
    if '/auth/' in path_str:
        return True, "Auth route (public)"
    
    # Skip public routes
    if '/public/' in path_str:
        return True, "Public route"
    
    # Skip email routes (public)
    if '/email/' in path_str:
        return True, "Email route (public)"
    
    # Skip payment webhook routes (external callbacks)
    if 'webhook' in path_str.lower():
        return True, "Webhook route"
    
    # Skip subscription/payment initiation (may not need tenant context yet)
    if '/subscription/' in path_str or '/payment/initiate' in path_str:
        return True, "Subscription/payment route"
    
    return False, None

def update_route_file(filepath):
    """Update a single route file with buildBFFHeaders()"""
    global updated_count, skipped_count, error_count
    
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Skip if already uses buildBFFHeaders
        if 'buildBFFHeaders' in content:
            print(f"   ⏭️  Already updated")
            skipped_count += 1
            return
        
        # Skip if doesn't make fetch calls
        if 'fetch(' not in content:
            print(f"   ⏭️  No fetch calls")
            skipped_count += 1
            return
        
        # Check if should skip based on path
        should_skip, reason = should_skip_file(filepath)
        if should_skip:
            print(f"   ⏭️  {reason}")
            skipped_count += 1
            return
        
        original_content = content
        
        # Step 1: Add import if not present
        if 'from "@/lib/bffHelpers"' not in content:
            # Find where to insert import
            if 'import { NextRequest, NextResponse }' in content:
                content = content.replace(
                    'import { NextRequest, NextResponse } from "next/server";',
                    'import { NextRequest, NextResponse } from "next/server";\nimport { buildBFFHeaders } from "@/lib/bffHelpers";'
                )
            elif 'import' in content:
                # Add after first import
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith('import'):
                        lines.insert(i + 1, 'import { buildBFFHeaders } from "@/lib/bffHelpers";')
                        break
                content = '\n'.join(lines)
        
        # Step 2: Replace cookie header patterns
        # Pattern 1: const cookieHeader = request.headers.get("cookie") || "";
        content = re.sub(
            r'const cookieHeader = request\.headers\.get\(["\']cookie["\']\).*?;',
            '// Headers now built with buildBFFHeaders() including subdomain',
            content
        )
        
        # Pattern 2: Replace headers object in fetch calls
        # Match: headers: { "Content-Type": "application/json", Cookie: cookieHeader }
        content = re.sub(
            r'headers:\s*{\s*["\']Content-Type["\']: ["\']application/json["\']\s*,\s*Cookie:\s*cookieHeader\s*}',
            'headers: await buildBFFHeaders()',
            content
        )
        
        # Pattern 3: Match: headers: { "Content-Type": "application/json" }
        content = re.sub(
            r'headers:\s*{\s*["\']Content-Type["\']: ["\']application/json["\']\s*}',
            'headers: await buildBFFHeaders()',
            content
        )
        
        # Pattern 4: Just Cookie: cookieHeader in headers
        content = re.sub(
            r',\s*Cookie:\s*cookieHeader',
            '',
            content
        )
        
        # Check if any changes were made
        if content == original_content:
            print(f"   ⚠️  No pattern matched")
            skipped_count += 1
            return
        
        if not DRY_RUN:
            # Write updated content
            with open(filepath, 'w') as f:
                f.write(content)
        
        print(f"   ✅ Updated")
        updated_count += 1
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        error_count += 1

def main():
    print("🔧 BFF Routes Updater for Subdomain Support")
    print("=" * 60)
    
    if DRY_RUN:
        print("🔍 DRY RUN MODE - No files will be modified")
        print("=" * 60)
    
    # Find all route.ts files
    route_files = list(ROUTES_DIR.rglob("route.ts"))
    print(f"\n📊 Found {len(route_files)} route files\n")
    
    for filepath in sorted(route_files):
        relative_path = filepath.relative_to(ROUTES_DIR.parent.parent)
        print(f"📝 {relative_path}")
        update_route_file(filepath)
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    print(f"   ✅ Updated: {updated_count} routes")
    print(f"   ⏭️  Skipped: {skipped_count} routes")
    print(f"   ❌ Errors: {error_count} routes")
    print("=" * 60)

if __name__ == "__main__":
    main()
