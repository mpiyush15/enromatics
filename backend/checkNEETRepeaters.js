import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";
import Batch from "./src/models/Batch.js";
import BatchStudent from "./src/models/BatchStudent.js";

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

const checkBatch = async () => {
  try {
    // Find NEET Repeaters batch
    const batch = await Batch.findOne({ name: { $regex: "NEET Repeaters", $options: "i" } }).lean();
    
    if (!batch) {
      console.log("❌ NEET Repeaters batch not found");
      return;
    }

    console.log(`📚 NEET Repeaters Batch Details:`);
    console.log(`   ID: ${batch._id}`);
    console.log(`   Name: ${batch.name}`);
    console.log(`   Course: ${batch.courseId}`);
    console.log(`   Status: ${batch.status}\n`);

    // Get all BatchStudent records for this batch
    const batchStudents = await BatchStudent.find({
      batchId: batch._id,
      status: "active"
    }).populate("studentId", "name email course phone");

    console.log(`👥 Students in NEET Repeaters batch:\n`);
    if (batchStudents.length === 0) {
      console.log("   No students found\n");
    } else {
      batchStudents.forEach((bs, i) => {
        const student = bs.studentId;
        console.log(`   ${i + 1}. ${student.name}`);
        console.log(`      Email: ${student.email}`);
        console.log(`      Course: ${student.course}`);
        console.log(`      Status: ${bs.status}`);
        console.log(`      Joined: ${bs.joinedAt.toLocaleDateString()}\n`);
      });
    }

    console.log(`✅ Total: ${batchStudents.length} students`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
};

connectDB().then(checkBatch);
