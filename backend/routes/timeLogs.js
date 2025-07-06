import express from 'express';
import { body } from 'express-validator';
import {
  getTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
  getTimeLogStats
} from '../controllers/timeLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const timeLogValidation = [
  body('taskId').isMongoId().withMessage('Valid task ID is required'),
  body('hours').isFloat({ min: 0.1, max: 24 }).withMessage('Hours must be between 0.1 and 24'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('billable').optional().isBoolean().withMessage('Billable must be a boolean')
];

// Routes
router.get('/', protect, getTimeLogs);
router.get('/stats', protect, getTimeLogStats);
router.post('/', protect, timeLogValidation, createTimeLog);
router.put('/:id', protect, timeLogValidation, updateTimeLog);
router.delete('/:id', protect, deleteTimeLog);

export default router;