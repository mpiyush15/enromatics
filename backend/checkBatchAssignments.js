/**
 * Debug script to check batch-student assignments
 * Run: node checkBatchAssignments.js
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

const checkAssignments = async () => {
  try {
    console.log("\n📊 BATCH-STUDENT ASSIGNMENT AUDIT\n");

    // Get all students
    const students = await Student.find().select("_id name course batch batchId").lean();
    console.log(`📌 Total Students: ${students.length}`);

    // Get all batches
    const batches = await Batch.find().select("_id name courseId").lean();
    console.log(`📌 Total Batches: ${batches.length}\n`);

    // Get all batch-student mappings
    const batchStudents = await BatchStudent.find()
      .select("studentId batchId status")
      .lean();
    console.log(`📌 Total BatchStudent Mappings: ${batchStudents.length}\n`);

    // Check discrepancies
    console.log("🔍 STUDENTS WITHOUT BATCH ASSIGNMENT:\n");
    let unassignedCount = 0;
    const unassignedStudents = students.filter(s => !s.batchId);
    unassignedStudents.forEach(s => {
      console.log(`  ❌ ${s.name} (${s.course}) - No batchId`);
      unassignedCount++;
    });
    console.log(`\n  Total Unassigned: ${unassignedCount}\n`);

    console.log("✅ STUDENTS WITH BATCH ASSIGNMENT:\n");
    let assignedCount = 0;
    const assignedStudents = students.filter(s => s.batchId);
    for (const student of assignedStudents) {
      const batchInfo = batches.find(b => b._id.toString() === student.batchId.toString());
      const batchStudentCount = batchStudents.filter(
        bs => bs.studentId.toString() === student._id.toString()
      ).length;
      
      console.log(`  ✅ ${student.name} (${student.course})`);
      console.log(`     └─ Batch: ${student.batch}`);
      console.log(`     └─ BatchId: ${student.batchId}`);
      console.log(`     └─ In BatchStudent collection: ${batchStudentCount} record(s)\n`);
      assignedCount++;
    }
    console.log(`  Total Assigned: ${assignedCount}\n`);

    // Check for orphaned BatchStudent records
    console.log("🔍 CHECKING FOR ORPHANED BATCHSTUDENT RECORDS:\n");
    let orphanedCount = 0;
    for (const bs of batchStudents) {
      const student = students.find(s => s._id.toString() === bs.studentId.toString());
      if (!student) {
        console.log(`  ⚠️  BatchStudent ${bs._id} references non-existent student ${bs.studentId}`);
        orphanedCount++;
      }
    }
    if (orphanedCount === 0) {
      console.log(`  ✅ No orphaned BatchStudent records found\n`);
    } else {
      console.log(`\n  Found ${orphanedCount} orphaned records\n`);
    }

    // Summary by course
    console.log("📚 SUMMARY BY COURSE:\n");
    const courseStats = {};
    students.forEach(s => {
      if (!courseStats[s.course]) {
        courseStats[s.course] = { total: 0, assigned: 0 };
      }
      courseStats[s.course].total++;
      if (s.batchId) {
        courseStats[s.course].assigned++;
      }
    });

    Object.entries(courseStats).forEach(([course, stats]) => {
      const percentage = ((stats.assigned / stats.total) * 100).toFixed(1);
      console.log(`  ${course}: ${stats.assigned}/${stats.total} (${percentage}%)`);
    });

    console.log("\n✅ Audit Complete!\n");
  } catch (err) {
    console.error("❌ Error during audit:", err);
  } finally {
    await mongoose.connection.close();
  }
};

connectDB().then(checkAssignments);
