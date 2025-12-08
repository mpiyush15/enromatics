import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import leadRoutes from "./routes/LeadRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import cookieParser from "cookie-parser";
import facebookRoutes from './routes/facebookRoutes.js';
import uiRoutes from './routes/uiRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import accountsRoutes from './routes/accountsRoutes.js';
import academicsRoutes from './routes/academicsRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import scholarshipExamRoutes from './routes/scholarshipExamRoutes.js';
import scholarshipResultRoutes from './routes/scholarshipResultRoutes.js';
import scholarshipRewardRoutes from './routes/scholarshipRewardRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import mobileAuthRoutes from './routes/mobileAuthRoutes.js';
import mobileScholarshipRoutes from './routes/mobileScholarshipRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';



dotenv.config();
connectDB();


const app = express();

// CORS - Allow both development and production domains
app.use(
  cors({
    origin: [
      "https://enromatics.com", 
      "https://enromatics.vercel.app",
      "https://endearing-blessing-production-c61f.up.railway.app",
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "http://localhost:3001"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/form", formRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/test", testRoutes);
app.use("/api/leads", leadRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/ui', uiRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/scholarship-exams', scholarshipExamRoutes);
app.use('/api/scholarship-results', scholarshipResultRoutes);
app.use('/api/scholarship-rewards', scholarshipRewardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/mobile-auth', mobileAuthRoutes);
app.use('/api/mobile-scholarship', mobileScholarshipRoutes);
app.use('/api/demo-requests', demoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get("/", (req, res) => res.send("✅ Enro Matics Backend Running"));

app.get("/api/test-cookie", (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json({ cookies: req.cookies });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
