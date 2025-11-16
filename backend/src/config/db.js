import mongoose from "mongoose";

const connectDB = async () => {
  // Debug: Log to see what Railway is providing
  console.log("🔍 Environment check:");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
  console.log("MONGODB_URI value:", process.env.MONGODB_URI ? "SET" : "UNDEFINED");
  console.log("All env keys:", Object.keys(process.env).filter(k => k.includes('MONGO')));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
    console.log("📦 Using database:", mongoose.connection.name);

  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
