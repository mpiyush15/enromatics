#!/usr/bin/env node

/**
 * Test WhatsApp Platform Sync
 * Tests if templates can be synced from WhatsApp Platform to MongoDB
 */

import axios from "axios"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({ path: "/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env" })

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"
const MONGODB_URI = process.env.MONGODB_URI

// Connect to MongoDB
async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB connected")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

// Get a test tenant
async function getTestTenant() {
  const Tenant = mongoose.model("Tenant", new mongoose.Schema({}, { strict: false }))
  const tenant = await Tenant.findOne({ whatsappConfig: { $exists: true, $ne: null } })
  
  if (!tenant) {
    console.error("❌ No tenant with WhatsApp config found")
    process.exit(1)
  }

  if (!tenant.whatsappConfig.isConfigured) {
    console.error("❌ WhatsApp not configured for this tenant")
    process.exit(1)
  }

  console.log(`✅ Found tenant: ${tenant.tenantId}`)
  console.log(`   Business Account ID: ${tenant.whatsappConfig.businessAccountId}`)
  console.log(`   Phone Number: ${tenant.whatsappConfig.phoneNumber}`)

  return tenant.tenantId
}

// Test sync templates
async function testSyncTemplates(tenantId) {
  try {
    console.log(`\n🔄 Testing template sync for tenant: ${tenantId}`)

    const response = await axios.post(`${BACKEND_URL}/api/whatsapp/templates/sync`, {
      tenantId,
    })

    if (response.data.success) {
      console.log(`✅ Sync successful!`)
      console.log(`   Synced ${response.data.syncedCount} templates`)
      return true
    } else {
      console.error(`❌ Sync failed:`, response.data.message)
      return false
    }
  } catch (error) {
    console.error(`❌ Error during sync:`, error.response?.data || error.message)
    return false
  }
}

// Fetch templates to verify
async function fetchTemplates(tenantId) {
  try {
    console.log(`\n📋 Fetching templates for tenant: ${tenantId}`)

    const response = await axios.get(`${BACKEND_URL}/api/whatsapp/templates?tenantId=${tenantId}`)

    if (response.data.success) {
      console.log(`✅ Fetched ${response.data.count} templates`)
      
      if (response.data.templates.length > 0) {
        console.log(`\n📝 Sample templates:`)
        response.data.templates.slice(0, 3).forEach((template) => {
          console.log(`   • ${template.templateName} (Status: ${template.status})`)
          console.log(`     Body: ${template.templateBody.substring(0, 50)}...`)
        })
      } else {
        console.log(`   No templates found`)
      }
      
      return response.data.templates.length > 0
    } else {
      console.error(`❌ Failed to fetch templates:`, response.data.message)
      return false
    }
  } catch (error) {
    console.error(`❌ Error fetching templates:`, error.response?.data || error.message)
    return false
  }
}

// Main test
async function runTests() {
  console.log("🧪 WhatsApp Platform Sync Test\n")
  console.log(`Backend URL: ${BACKEND_URL}`)
  console.log(`MongoDB: ${MONGODB_URI}\n`)

  try {
    // Connect to DB
    await connectDB()

    // Get a tenant with WhatsApp configured
    const tenantId = await getTestTenant()

    // Test sync
    const syncSuccess = await testSyncTemplates(tenantId)

    // Fetch templates
    if (syncSuccess) {
      const fetchSuccess = await fetchTemplates(tenantId)
      
      if (fetchSuccess) {
        console.log(`\n✅ SYNC TEST PASSED - Templates are working!`)
      } else {
        console.log(`\n⚠️  Sync completed but no templates returned`)
      }
    }

    await mongoose.disconnect()
    console.log(`\n✅ Test completed`)
  } catch (error) {
    console.error(`\n❌ Test failed:`, error.message)
    process.exit(1)
  }
}

runTests()
