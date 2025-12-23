import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
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
import courseRoutes from './routes/courseRoutes.js';
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
import subscriptionCheckoutRoutes from './routes/subscriptionCheckoutRoutes.js';
import { autoCancelStalePendingPayments } from './controllers/paymentController.js';
import { dropOldStaffIndexes } from './migrations/dropOldIndexes.js';



dotenv.config();
connectDB();


const app = express();

// Gzip compression - reduces response size by 50-70%
app.use(compression({
  level: 6, // Balanced compression (1=fastest, 9=best compression)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all compressible responses
    return compression.filter(req, res);
  }
}));

// CORS - Allow both development and production domains INCLUDING ALL SUBDOMAINS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      // Allowed domains and subdomain patterns
      const allowedPatterns = [
        // Exact domains
        'https://enromatics.com',
        'https://www.enromatics.com',
        'https://enromatics.vercel.app',
        'https://endearing-blessing-production-c61f.up.railway.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        // Subdomain patterns for production
        /^https:\/\/[\w-]+\.enromatics\.com$/,           // e.g., client.enromatics.com
        /^https:\/\/[\w-]+\.[\w-]+\.enromatics\.com$/,  // e.g., admin.client.enromatics.com
        // Subdomain patterns for localhost testing
        /^http:\/\/[\w-]+\.localhost:3000$/,             // e.g., client.localhost:3000
        /^http:\/\/[\w-]+\.[\w-]+\.localhost:3000$/,    // e.g., admin.client.localhost:3000
        /^http:\/\/[\w-]+\.lvh\.me:3000$/,               // e.g., client.lvh.me:3000
      ];
      
      // Check if origin matches any pattern
      const isAllowed = allowedPatterns.some(pattern => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return pattern === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Guard", "X-Tenant-Subdomain", "Cookie"],
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
app.use('/api/academics/courses', courseRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/scholarship-exams', scholarshipExamRoutes);
app.use('/api/scholarship-results', scholarshipResultRoutes);
app.use('/api/scholarship-rewards', scholarshipRewardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription', subscriptionCheckoutRoutes);
app.use('/api/mobile-auth', mobileAuthRoutes);
app.use('/api/mobile-scholarship', mobileScholarshipRoutes);
app.use('/api/demo-requests', demoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get("/", (req, res) => res.send("✅ Enro Matics Backend Running"));

// Test endpoint for POST
app.post("/api/test-post", (req, res) => {
  console.log('✅ Test POST endpoint hit');
  res.status(200).json({ message: "POST works fine", timestamp: new Date() });
});

app.get("/api/test-cookie", (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json({ cookies: req.cookies });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Run migrations on startup (after DB is connected)
  setTimeout(async () => {
    console.log('🔧 Running database migrations...');
    await dropOldStaffIndexes();
  }, 3000);
  
  // Run auto-cancel for stale pending payments on startup
  setTimeout(async () => {
    console.log('⏰ Running initial stale payment cleanup...');
    await autoCancelStalePendingPayments(10); // 10 minute timeout
  }, 5000);
  
  // Run auto-cancel every 10 minutes
  setInterval(async () => {
    console.log('⏰ Running scheduled stale payment cleanup...');
    await autoCancelStalePendingPayments(10);
  }, 10 * 60 * 1000); // Every 10 minutes
});
