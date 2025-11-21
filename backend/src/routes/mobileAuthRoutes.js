import express from 'express';
import { 
  registerMobileUser, 
  loginMobileUser, 
  getMobileUserProfile,
  updateMobileUserProfile
} from '../controllers/mobileAuthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/register', registerMobileUser);
router.post('/login', loginMobileUser);

// Protected routes (require authentication)
router.use(protect);
router.get('/profile', getMobileUserProfile);
router.put('/profile', updateMobileUserProfile);

export default router;