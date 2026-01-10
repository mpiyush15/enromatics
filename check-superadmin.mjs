import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

async function checkSuperAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    console.log("Database:", mongoose.connection.name);

    // Check all users
    const allUsers = await User.find().select("+password");
    console.log("\n📊 Total users in database:", allUsers.length);
    
    // Look for superadmin
    const superadmin = await User.findOne({ role: "SUPERADMIN" }).select("+password");
    console.log("\n🔍 SUPERADMIN user found:");
    if (superadmin) {
      console.log("  Email:", superadmin.email);
      console.log("  Name:", superadmin.name);
      console.log("  Role:", superadmin.role);
      console.log("  Status:", superadmin.status);
    } else {
      console.log("  ❌ NO SUPERADMIN USER FOUND!");
    }
    
    // Look for piyush
    const piyush = await User.findOne({ email: "piyush@pixelsdigital.tech" }).select("+password");
    console.log("\n🔍 User with piyush@pixelsdigital.tech:");
    if (piyush) {
      console.log("  Name:", piyush.name);
      console.log("  Email:", piyush.email);
      console.log("  Role:", piyush.role);
      console.log("  Status:", piyush.status);
    } else {
      console.log("  ❌ NOT FOUND!");
    }

    // Show first 5 users
    console.log("\n📋 First 5 users in database:");
    const first5 = await User.find().limit(5).select("email name role status");
    first5.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email} (${u.role}) - ${u.status}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkSuperAdmin();
