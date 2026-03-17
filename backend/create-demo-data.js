import mongoose from 'mongoose';
import Subject from './src/models/Subject.js';
import Chapter from './src/models/Chapter.js';

const uri = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/enromatics';
const tenantId = '69399b7e6ac71f38cf0bd66b'; // shreecoaching

const demoSubjects = [
  { name: 'Mathematics', description: 'Mathematics for Class 11-12' },
  { name: 'Physics', description: 'Physics for Class 11-12' },
  { name: 'Chemistry', description: 'Chemistry for Class 11-12' },
  { name: 'Biology', description: 'Biology for Class 11-12' },
  { name: 'English', description: 'English Literature & Language' },
];

const demoChapters = {
  Mathematics: [
    'Algebra',
    'Trigonometry',
    'Calculus',
    'Geometry',
    'Statistics',
  ],
  Physics: [
    'Mechanics',
    'Thermodynamics',
    'Electromagnetism',
    'Optics',
    'Modern Physics',
  ],
  Chemistry: [
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Physical Chemistry',
    'Biochemistry',
  ],
  Biology: [
    'Cell Biology',
    'Genetics',
    'Ecology',
    'Evolution',
    'Physiology',
  ],
  English: [
    'Poetry',
    'Prose',
    'Drama',
    'Grammar',
    'Composition',
  ],
};

async function createDemoData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(uri);

    console.log('\n📚 Creating subjects...');
    for (const subjectData of demoSubjects) {
      const subject = new Subject({
        tenantId,
        name: subjectData.name,
        description: subjectData.description,
        status: 'active',
        createdBy: 'system-admin',
      });
      await subject.save();
      console.log(`   ✅ Created: ${subjectData.name}`);
    }

    console.log('\n📖 Creating chapters...');
    for (const [subjectName, chapters] of Object.entries(demoChapters)) {
      const subject = await Subject.findOne({ tenantId, name: subjectName });

      for (const chapterName of chapters) {
        const chapter = new Chapter({
          tenantId,
          subjectId: subject._id,
          name: chapterName,
          description: `Chapter: ${chapterName}`,
          status: 'active',
          createdBy: 'system-admin',
        });
        await chapter.save();
        console.log(`   ✅ Created: ${subjectName} → ${chapterName}`);
      }
    }

    console.log('\n✅ Demo data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoData();
