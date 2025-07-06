import express from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const projectValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Project name must be between 2 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
];

// Routes
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.get('/:id/stats', protect, getProjectStats);
router.post('/', protect, authorize('department_manager', 'team_lead', 'super_admin'), projectValidation, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, authorize('department_manager', 'super_admin'), deleteProject);

export default router;