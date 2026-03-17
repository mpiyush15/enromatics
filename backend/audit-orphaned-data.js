const mongoose = require('mongoose');
const uri = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/enromatics';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('🔍 AUDIT: Checking for ORPHANED DATA across all collections');
  console.log('='.repeat(60));
  
  // Get all valid tenantIds
  const validTenants = await db.collection('tenants').find({}).toArray();
  const validTenantIds = new Set(validTenants.map(t => t.tenantId || t._id.toString()));
  
  console.log('\n✅ Valid tenant IDs in database:');
  validTenantIds.forEach(id => console.log('   - ' + id));
  
  // Check for orphaned records in key collections
  const collections = ['students', 'batches', 'tests', 'questions', 'enrollments', 'fees'];
  console.log('\n🔴 ORPHANED DATA (records without matching tenant):');
  
  for (const collName of collections) {
    try {
      const allRecords = await db.collection(collName).find({}).toArray();
      const orphaned = allRecords.filter(r => !validTenantIds.has(r.tenantId?.toString()));
      
      if(orphaned.length > 0) {
        console.log(`\n   [${collName}] - ${orphaned.length} orphaned records:`);
        // Group by tenantId
        const byTenant = {};
        orphaned.forEach(r => {
          const tid = r.tenantId?.toString() || 'null';
          byTenant[tid] = (byTenant[tid] || 0) + 1;
        });
        Object.entries(byTenant).forEach(([tid, count]) => {
          console.log(`      - tenantId '${tid}': ${count} records`);
        });
      }
    } catch(e) {
      // Collection might not exist
    }
  }
  
  console.log('\n📋 ROOT CAUSE ANALYSIS:');
  console.log('   - Did tenant get deleted without deleting child records?');
  console.log('   - Was there a database migration that broke references?');
  console.log('   - Were tenants manually deleted from MongoDB?');
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
