import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();
await connectDB();

const CreateSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (existing) {
      console.log("⚠️ Super Admin already exists");
      process.exit();
    }

    const superAdmin = await User.create({
      name: "Enro Matics Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: "Pm@22442232", // 👈 Plain password — let model hash it automatically
      role: "SuperAdmin",
      tenantId: "global",
    });

    console.log("✅ Super Admin created successfully");
    console.log(superAdmin);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating Super Admin", err);
    process.exit(1);
  }
};

CreateSuperAdmin();
