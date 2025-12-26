/**
 * Seed Subscription Plans to MongoDB
 * 
 * Run: cd backend && node scripts/seed-subscription-plans.js
 * 
 * This script migrates static plans data to database
 * SuperAdmin can then manage all plans from dashboard
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Define the schema inline to avoid import issues
const subscriptionPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    monthlyPrice: {
      type: mongoose.Schema.Types.Mixed, // Number or "Free" or "Custom"
      required: true,
    },
    annualPrice: {
      type: mongoose.Schema.Types.Mixed, // Number or "Free" or "Custom"
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [mongoose.Schema.Types.Mixed], // Array of strings or objects with {name, enabled}
      default: [],
    },
    highlightFeatures: {
      type: [String],
      default: [],
    },
    buttonLabel: {
      type: String,
      default: "Get Started",
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    cta: {
      type: String,
      default: "",
    },
    quotas: {
      students: { type: mongoose.Schema.Types.Mixed },
      staff: { type: mongoose.Schema.Types.Mixed },
      storage: { type: mongoose.Schema.Types.Mixed },
      concurrentTests: { type: Number, default: 1 },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

// Plans data (same as frontend/data/plans.ts)
const subscriptionPlans = [
  {
    id: "trial",
    name: "Trial",
    monthlyPrice: "Free",
    annualPrice: "Free",
    description: "Try everything free for 14 days",
    features: [
      { name: "Full platform access", enabled: true },
      { name: "All core features included", enabled: true },
      { name: "Web portal + subdomain", enabled: true },
      { name: "No credit card required", enabled: true },
      { name: "14 days free trial", enabled: true },
    ],
    highlightFeatures: ["14 Days Free", "All Features", "No Card Required"],
    buttonLabel: "Start Free Trial",
    popular: false,
    isVisible: true,
    cta: "trial",
    quotas: {
      students: "Trial Access",
      staff: "Trial Access",
      storage: "Trial Access",
      concurrentTests: 1,
    },
    displayOrder: 0,
    status: "active",
  },
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 999,
    annualPrice: 8399,
    description: "Essential features for small coaching centers",
    features: [
      { name: "Up to 100 students", enabled: true },
      { name: "Up to 5 staff accounts", enabled: true },
      { name: "Attendance & fees management", enabled: true },
      { name: "Email notifications", enabled: true },
      { name: "Standard support", enabled: true },
    ],
    highlightFeatures: ["100 Students", "5 Staff", "Core Features"],
    buttonLabel: "Get Started",
    popular: false,
    isVisible: true,
    quotas: {
      students: 100,
      staff: 5,
      storage: "Standard",
      concurrentTests: 1,
    },
    displayOrder: 1,
    status: "active",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 2499,
    annualPrice: 20999,
    description: "Advanced features for growing institutes",
    features: [
      { name: "Up to 300 students", enabled: true },
      { name: "Up to 25 staff accounts", enabled: true },
      { name: "Exams & results automation", enabled: true },
      { name: "Advanced analytics & reports", enabled: true },
      { name: "Student mobile app (basic)", enabled: true },
      { name: "Social media tools (beta)", enabled: true },
    ],
    highlightFeatures: ["300 Students", "25 Staff", "Mobile App"],
    buttonLabel: "Get Started",
    popular: true,
    isVisible: true,
    quotas: {
      students: 300,
      staff: 25,
      storage: "Enhanced",
      concurrentTests: 3,
    },
    displayOrder: 2,
    status: "active",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    description: "Complete solution with dedicated support",
    features: [
      { name: "Unlimited students & staff", enabled: true },
      { name: "Parent mobile app", enabled: true },
      { name: "Custom branding & app publishing", enabled: true },
      { name: "Multi-branch management", enabled: true },
      { name: "Audit logs & data backup", enabled: true },
      { name: "WABA automation", enabled: true },
      { name: "Dedicated account manager", enabled: true },
      { name: "SLA commitment", enabled: true },
    ],
    highlightFeatures: ["Unlimited", "Full Mobile Apps", "Priority Support"],
    buttonLabel: "Contact Sales",
    popular: false,
    isVisible: true,
    quotas: {
      students: "Unlimited",
      staff: "Unlimited",
      storage: "Unlimited",
      concurrentTests: 10,
    },
    displayOrder: 3,
    status: "active",
  },
];

async function seedPlans() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error("❌ No MongoDB URI found in environment variables");
      process.exit(1);
    }
    
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Check existing plans
    const existingCount = await SubscriptionPlan.countDocuments();
    console.log(`📊 Found ${existingCount} existing plans in database`);

    if (existingCount > 0) {
      console.log("⚠️  Plans already exist. Do you want to:");
      console.log("   1. Skip seeding (default)");
      console.log("   2. Run with --force flag to clear and reseed");
      
      if (process.argv.includes("--force")) {
        console.log("🗑️  --force flag detected. Clearing existing plans...");
        await SubscriptionPlan.deleteMany({});
        console.log("✅ Cleared existing plans");
      } else {
        console.log("ℹ️  Skipping seed. Use --force to override.");
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    // Insert plans
    console.log("📝 Seeding subscription plans...");
    for (const plan of subscriptionPlans) {
      const result = await SubscriptionPlan.create(plan);
      console.log(`   ✅ Created: ${result.name} (${result.planId})`);
    }

    console.log("\n🎉 Successfully seeded all subscription plans!");
    console.log("📊 Total plans in database:", await SubscriptionPlan.countDocuments());

    // List all plans
    const allPlans = await SubscriptionPlan.find({}).sort({ displayOrder: 1 });
    console.log("\n📋 Plans in database:");
    allPlans.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ₹${p.monthlyPrice}/month | ${p.features.length} features`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Done! Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedPlans();
