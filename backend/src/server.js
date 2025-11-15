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
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import accountsRoutes from './routes/accountsRoutes.js';
import academicsRoutes from './routes/academicsRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';



dotenv.config();
connectDB();


const app = express();

// CORS configuration with support for production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  process.env.FRONTEND_URL, // Add production URL via environment variable
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,               // ✅ allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get("/", (req, res) => res.send("✅ Enro Matics Backend Running"));
app.use("/api/auth", authRoutes);

app.get("/api/test-cookie", (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json({ cookies: req.cookies });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
