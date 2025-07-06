import express from 'express';
import { body } from 'express-validator';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  addMember,
  removeMember
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const departmentValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('managerId').isMongoId().withMessage('Valid manager ID is required')
];

// Routes
router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartment);
router.post('/', protect, authorize('super_admin'), departmentValidation, createDepartment);
router.put('/:id', protect, authorize('super_admin', 'department_manager'), departmentValidation, updateDepartment);
router.post('/:id/members', protect, authorize('super_admin', 'department_manager'), addMember);
router.delete('/:id/members/:userId', protect, authorize('super_admin', 'department_manager'), removeMember);

export default router;