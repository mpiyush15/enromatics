import express from "express";
import { 
  loginStudent, 
  getCurrentStudent, 
  logoutStudent, 
  getStudentAttendance,
  updateStudentProfile,
  getStudentPayments,
  getStudentNotifications
} from "../controllers/studentAuthController.js";
import { protectStudent } from "../middleware/protectStudent.js";

const router = express.Router();

router.post("/login", loginStudent);
router.get("/me", protectStudent, getCurrentStudent);
router.put("/update-profile", protectStudent, updateStudentProfile);
router.get("/attendance", protectStudent, getStudentAttendance);
router.get("/payments", protectStudent, getStudentPayments);
router.get("/notifications", protectStudent, getStudentNotifications);
router.post("/logout", protectStudent, logoutStudent);

export default router;
