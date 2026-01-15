import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";
import Batch from "./src/models/Batch.js";
import Test from "./src/models/Test.js";
import TestMarks from "./src/models/TestMarks.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
};

const testAkshayProgress = async () => {
  try {
    // Find NEET Repeaters batch
    const batch = await Batch.findOne({ name: { $regex: "NEET", $options: "i" } }).lean();
    console.log("📚 Batch found:", batch?.name);

    // Find Akshay Jogee student
    const student = await Student.findOne({ 
      name: { $regex: "Akshay", $options: "i" },
      batchName: { $regex: "NEET", $options: "i" }
    }).lean();

    if (!student) {
      console.log("❌ Student Akshay Jogee in NEET Repeaters not found");
      console.log("\nSearching all students with 'Akshay'...");
      const akshayStudents = await Student.find({ 
        name: { $regex: "Akshay", $options: "i" }
      }).lean();
      console.log(`Found ${akshayStudents.length} students with 'Akshay':`);
      akshayStudents.forEach(s => {
        console.log(`  - ${s.name} (Batch: ${s.batchName})`);
      });
      return;
    }

    console.log("\n👤 Student Found:");
    console.log(`   Name: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Batch: ${student.batchName}`);
    console.log(`   ID: ${student._id}`);

    // Get all tests
    const allTests = await Test.find({}).lean();
    console.log(`\n📝 Total Tests in Database: ${allTests.length}`);

    // Get marks for this student
    const studentMarks = await TestMarks.find({ studentId: student._id })
      .populate("testId", "name subject testDate totalMarks passingMarks")
      .lean();

    console.log(`\n✅ Student Test Results: ${studentMarks.length}`);
    if (studentMarks.length > 0) {
      studentMarks.forEach((mark, i) => {
        const test = mark.testId;
        console.log(`\n   ${i + 1}. ${test?.name}`);
        console.log(`      Subject: ${test?.subject}`);
        console.log(`      Marks Obtained: ${mark.marksObtained}/${test?.totalMarks}`);
        console.log(`      Percentage: ${((mark.marksObtained / test?.totalMarks) * 100).toFixed(2)}%`);
        console.log(`      Status: ${mark.marksObtained >= test?.passingMarks ? '✅ PASS' : '❌ FAIL'}`);
      });
    } else {
      console.log("   No test results found for this student");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

connectDB().then(testAkshayProgress);
