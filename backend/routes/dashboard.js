import express from 'express';
import {
  getDashboardStats,
  getUserDashboard,
  getTeamDashboard
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/stats', protect, getDashboardStats);
router.get('/user', protect, getUserDashboard);
router.get('/team', protect, getTeamDashboard);

export default router;