import express from 'express';
import {
  createNotification,
  getStudentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { protectStudent } from '../middleware/protectStudent.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes (create notifications from web app)
router.post('/create', protect, createNotification);

// Student routes (mobile app)
router.get('/student', protectStudent, getStudentNotifications);
router.put('/:notificationId/read', protectStudent, markAsRead);
router.put('/mark-all-read', protectStudent, markAllAsRead);
router.delete('/:notificationId', protectStudent, deleteNotification);

export default router;
