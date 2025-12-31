import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://mpiyush:PariDoshi%40123@cluster0.gqb1u.mongodb.net/enromatics?retryWrites=true&w=majority&appName=Cluster0';

try {
  await mongoose.connect(MONGO_URI);
  console.log('📡 Connected to MongoDB');
  
  // Delete inactive workflows
  const result = await mongoose.connection.collection('automationworkflows').deleteMany({ status: 'inactive' });
  console.log(`\n🗑️  Deleted ${result.deletedCount} inactive workflows`);
  
  // Show remaining workflows
  const remaining = await mongoose.connection.collection('automationworkflows').find({}).toArray();
  console.log(`\n✅ Remaining workflows (${remaining.length}):`);
  remaining.forEach(w => {
    console.log(`  - ${w.name} (${w.status})`);
  });
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
