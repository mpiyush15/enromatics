/**
 * Script to link batches with their corresponding courses
 * This script will:
 * 1. Find all batches and courses
 * 2. Match batches to courses based on batch name containing course name
 * 3. Update batches with correct courseId
 * 4. Display the mapping
 */

import mongoose from 'mongoose';
import Batch from './src/models/Batch.js';
import Course from './src/models/Course.js';
import BatchStudent from './src/models/BatchStudent.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

mongoose.connect(MONGODB_URI).then(async () => {
  try {
    console.log('\n========== BATCH → COURSE LINKING ==========\n');

    // Get all courses and batches
    const courses = await Course.find({}).lean();
    const batches = await Batch.find({}).lean();

    console.log(`Found ${courses.length} courses and ${batches.length} batches\n`);

    // Display current state
    console.log('========== CURRENT STATE ==========');
    console.log('\nCOURSES:');
    courses.forEach(c => {
      console.log(`  • ${c.name} (ID: ${c._id})`);
    });

    console.log('\nBATCHES:');
    batches.forEach(b => {
      const status = b.courseId ? '✓' : '❌';
      console.log(`  ${status} ${b.name}`);
      if (b.courseId) console.log(`      → CourseId: ${b.courseId}`);
    });

    // Try to link batches to courses
    console.log('\n========== LINKING BATCHES TO COURSES ==========\n');
    
    let updated = 0;
    let alreadyLinked = 0;
    let unlinked = 0;

    for (let batch of batches) {
      // Try to find course that matches batch name
      const matchingCourse = courses.find(c => {
        const batchNameLower = batch.name.toLowerCase();
        const courseNameLower = c.name.toLowerCase();
        
        // Check if course name is contained in batch name
        return batchNameLower.includes(courseNameLower) || courseNameLower.includes(batchNameLower);
      });

      if (matchingCourse) {
        if (!batch.courseId) {
          // Update batch with courseId
          await Batch.findByIdAndUpdate(batch._id, { courseId: matchingCourse._id });
          console.log(`✓ Linked "${batch.name}" → "${matchingCourse.name}"`);
          updated++;
        } else if (batch.courseId.toString() === matchingCourse._id.toString()) {
          console.log(`✓ Already linked: "${batch.name}" → "${matchingCourse.name}"`);
          alreadyLinked++;
        } else {
          console.log(`⚠ Different link: "${batch.name}" → "${matchingCourse.name}" (was: ${batch.courseId})`);
        }
      } else {
        console.log(`❌ No matching course for "${batch.name}"`);
        unlinked++;
      }
    }

    // Display final state with student counts
    console.log('\n========== FINAL STATE WITH STUDENT COUNTS ==========\n');
    
    const updatedBatches = await Batch.find({}).lean();
    const updatedCourses = await Course.find({}).lean();

    for (let course of updatedCourses) {
      console.log(`\n📚 ${course.name}`);
      const courseBatches = updatedBatches.filter(b => 
        b.courseId && b.courseId.toString() === course._id.toString()
      );

      if (courseBatches.length === 0) {
        console.log('  (No batches linked)');
      } else {
        let totalStudents = 0;
        for (let batch of courseBatches) {
          const studentCount = await BatchStudent.countDocuments({ 
            batchId: batch._id, 
            status: 'active' 
          });
          console.log(`  └─ ${batch.name}: ${studentCount} students`);
          totalStudents += studentCount;
        }
        console.log(`  Total: ${totalStudents} students`);
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log(`✓ Updated: ${updated} batches`);
    console.log(`✓ Already linked: ${alreadyLinked} batches`);
    console.log(`❌ Unlinked: ${unlinked} batches`);
    console.log('\n✓ Course-Batch linking complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
});
