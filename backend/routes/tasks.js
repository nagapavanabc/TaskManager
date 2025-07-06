import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  uploadAttachment,
  getMyTasks
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('effortEstimate').optional().isNumeric().withMessage('Effort estimate must be a number'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline is required')
];

const commentValidation = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
];

// Routes
router.get('/', protect, getTasks);
router.get('/my-tasks', protect, getMyTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, taskValidation, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/:id/comments', protect, commentValidation, addComment);
router.post('/:id/attachments', protect, upload.single('file'), uploadAttachment);

export default router;