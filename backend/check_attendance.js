import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const attendanceSchema = new mongoose.Schema({
  testId: mongoose.Schema.Types.ObjectId,
  studentId: mongoose.Schema.Types.ObjectId,
  tenantId: String,
  present: Boolean,
  remarks: String,
  markedBy: mongoose.Schema.Types.ObjectId,
  markedAt: Date,
}, { timestamps: true });

const TestAttendance = mongoose.model("TestAttendance", attendanceSchema);

async function checkAttendance() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    const count = await TestAttendance.countDocuments();
    console.log(`\n📊 Total Attendance Records: ${count}`);
    
    if (count > 0) {
      const records = await TestAttendance.find().limit(5);
      console.log("\nSample records:");
      records.forEach(r => {
        console.log(`  - Test: ${r.testId}, Student: ${r.studentId}, Present: ${r.present}, MarkedBy: ${r.markedBy}`);
      });
    }
    
    // Group by testId
    const groupedByTest = await TestAttendance.aggregate([
      { $group: { _id: "$testId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\nAttendance records by test:`);
    groupedByTest.slice(0, 5).forEach(g => {
      console.log(`  - Test ${g._id}: ${g.count} records`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkAttendance();
