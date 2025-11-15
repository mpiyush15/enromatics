import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Student from "../models/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const fixStudentPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find students without passwords
    const studentsWithoutPassword = await Student.find({ 
      $or: [
        { password: { $exists: false } }, 
        { password: null },
        { password: "" }
      ] 
    });

    console.log(`\n📊 Found ${studentsWithoutPassword.length} students without passwords\n`);

    if (studentsWithoutPassword.length === 0) {
      console.log("✅ All students have passwords!");
      process.exit(0);
    }

    for (const student of studentsWithoutPassword) {
      // Generate a random password
      const generatedPassword = Math.random().toString(36).slice(-8);
      
      student.password = generatedPassword;
      await student.save();
      
      console.log(`✅ Fixed student: ${student.name} (${student.email})`);
      console.log(`   Generated Password: ${generatedPassword}`);
      console.log(`   Roll Number: ${student.rollNumber || 'N/A'}`);
      console.log(`   Course: ${student.course}\n`);
    }

    console.log(`\n✅ Successfully updated ${studentsWithoutPassword.length} students`);
    console.log("⚠️  Save the above passwords and share them with the respective students");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixStudentPasswords();
