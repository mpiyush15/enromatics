import mongoose from 'mongoose';
import AutomationWorkflow from './src/models/AutomationWorkflow.js';

await mongoose.connect('mongodb+srv://mpiyush15:piyush1510@pixels.d24yk.mongodb.net/enromatics?retryWrites=true&w=majority');

console.log('🔧 Fixing workflow phone numbers...\n');

// Update all workflows with wrong phone number
const result = await AutomationWorkflow.updateMany(
  { linkedPhoneNumber: '9766504856' },
  { linkedPhoneNumber: '889344924259692' }
);

console.log(`✅ Updated ${result.modifiedCount} workflows`);

// Show all workflows
const workflows = await AutomationWorkflow.find(
  { tenantId: 'global' },
  'name linkedPhoneNumber status isPublished triggerKeyword'
);

console.log('\n📋 All workflows now:\n');
workflows.forEach(w => {
  const willTrigger = w.status === 'active' && w.isPublished ? '✅' : '⚠️';
  console.log(`${willTrigger} ${w.name}`);
  console.log(`   Phone: ${w.linkedPhoneNumber} (Expected: 889344924259692)`);
  console.log(`   Status: ${w.status} | Published: ${w.isPublished}`);
  console.log(`   Triggers: ${w.triggerKeyword}\n`);
});

await mongoose.connection.close();
