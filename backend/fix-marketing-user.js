const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define minimal User schema with pre-save middleware
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  tenantId: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb+srv://mpiyush2727:mpiyush2727@cluster0.mongodb.net/pixels_db?retryWrites=true&w=majority').then(async () => {
  console.log('Connected to MongoDB\n');
  
  // Find or create user
  let user = await User.findOne({ email: 'info@enromatics.com' });
  
  if (!user) {
    console.log('Creating new user...');
    user = new User({
      email: 'info@enromatics.com',
      password: 'Pm@22442232',
      name: 'Enromatics Marketing',
      role: 'marketing',
      tenantId: 'enromatics'
    });
  } else {
    console.log('Updating existing user...');
    user.password = 'Pm@22442232';
  }
  
  await user.save();
  console.log('✅ User saved with properly hashed password\n');
  console.log('Email:', user.email);
  console.log('Password hash:', user.password);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  
  // Test bcrypt.compare
  console.log('\n🔐 Testing password comparison...');
  const match = await bcrypt.compare('Pm@22442232', user.password);
  console.log('bcrypt.compare("Pm@22442232", hash) returns:', match ? '✅ TRUE' : '❌ FALSE');
  
  process.exit(0);
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
