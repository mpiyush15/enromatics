#!/bin/bash

echo "🔍 Testing Sidebar Connection..."
echo ""

# Test 1: Check if backend is running
echo "1️⃣ Checking if backend is running on port 5050..."
if lsof -Pi :5050 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend is running on port 5050"
else
    echo "❌ Backend is NOT running on port 5050"
    echo "   Please start backend with: cd backend && npm run dev"
    exit 1
fi

echo ""

# Test 2: Check if frontend is running
echo "2️⃣ Checking if frontend is running on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend is NOT running on port 3000"
    echo "   Please start frontend with: cd frontend && npm run dev"
fi

echo ""

# Test 3: Test backend sidebar endpoint (without auth)
echo "3️⃣ Testing backend sidebar endpoint (will fail without auth)..."
curl -i -s http://localhost:5050/api/ui/sidebar | head -20

echo ""
echo ""
echo "4️⃣ Testing frontend BFF endpoint (will fail without auth)..."
curl -i -s http://localhost:3000/api/ui/sidebar | head -20

echo ""
echo ""
echo "✅ Connection test complete!"
echo ""
echo "💡 If you see 401 Unauthorized, that's expected without authentication."
echo "💡 If you see 'Connection refused', check if the server is running."
