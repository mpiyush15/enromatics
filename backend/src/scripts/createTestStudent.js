import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Student from "../models/Student.js";

dotenv.config();
await connectDB();

const createTestStudent = async () => {
  try {
    // Check if test student already exists
    const existing = await Student.findOne({ email: "test.student@example.com" });
    if (existing) {
      console.log("⚠️ Test student already exists");
      console.log("Email: test.student@example.com");
      console.log("Password: testpass123");
      process.exit();
    }

    // Create test student
    const testStudent = await Student.create({
      name: "Test Student",
      email: "test.student@example.com",
      password: "testpass123", // Will be hashed automatically
      rollNumber: "TEST001",
      course: "Computer Science",
      batch: "2024-25",
      phone: "1234567890",
      tenantId: "global", // Using global tenant for testing
      fees: 50000,
      balance: 30000, // Student has paid 30k out of 50k
      status: "active"
    });

    console.log("✅ Test student created successfully!");
    console.log("Email: test.student@example.com");
    console.log("Password: testpass123");
    console.log("Student Details:", testStudent);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating test student:", err);
    process.exit(1);
  }
};

createTestStudent();