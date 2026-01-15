/**
 * Migration script: Sync Student.batchId to BatchStudent collection
 * This ensures all students with batchId have corresponding BatchStudent records
 * Run: node migrateStudentBatches.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";
import Batch from "./src/models/Batch.js";
import BatchStudent from "./src/models/BatchStudent.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const migrateStudentBatches = async () => {
  try {
    console.log("\n🔄 MIGRATING STUDENT BATCHES TO BATCHSTUDENT\n");

    // Get all students with batchId
    const studentsWithBatch = await Student.find({ batchId: { $ne: null } }).lean();
    console.log(`📌 Found ${studentsWithBatch.length} students with batchId\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const student of studentsWithBatch) {
      try {
        // Check if BatchStudent record already exists
        const existing = await BatchStudent.findOne({
          tenantId: student.tenantId,
          studentId: student._id,
          batchId: student.batchId,
        });

        if (existing) {
          console.log(`⏭️  ${student.name}: Already has BatchStudent record`);
          skipped++;
          continue;
        }

        // Create BatchStudent record
        const batchStudent = await BatchStudent.create({
          tenantId: student.tenantId,
          studentId: student._id,
          batchId: student.batchId,
          status: student.status || "active",
          joinedAt: student.joinDate || new Date(),
        });

        // Also update the Student.batch field with batch name for consistency
        const batch = await Batch.findById(student.batchId).select("name").lean();
        if (batch) {
          await Student.updateOne(
            { _id: student._id },
            { batch: batch.name }
          );
          console.log(`✅ ${student.name}: Created BatchStudent + updated batch name to "${batch.name}"`);
        } else {
          console.log(`⚠️  ${student.name}: Created BatchStudent but batch not found`);
        }

        created++;
      } catch (err) {
        console.error(`❌ ${student.name}: Migration failed -`, err.message);
        errors++;
      }
    }

    console.log(`\n📊 MIGRATION SUMMARY:\n`);
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped (already migrated): ${skipped}`);
    console.log(`  ❌ Errors: ${errors}\n`);

    // Verify migration
    const allBatchStudents = await BatchStudent.countDocuments();
    const allStudentsWithBatch = await Student.countDocuments({ batchId: { $ne: null } });
    
    console.log(`🔍 VERIFICATION:\n`);
    console.log(`  Total StudentBatch records: ${allBatchStudents}`);
    console.log(`  Total Students with batchId: ${allStudentsWithBatch}\n`);

    console.log("✅ Migration Complete!\n");
  } catch (err) {
    console.error("❌ Error during migration:", err);
  } finally {
    await mongoose.connection.close();
  }
};

connectDB().then(migrateStudentBatches);
