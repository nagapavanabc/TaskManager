import Task from '../models/Task.js';
import Project from '../models/Project.js';
import TimeLog from '../models/TimeLog.js';
import { validationResult } from 'express-validator';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { status, priority, assignee, project } = req.query;
    let query = { isActive: true };

    // Build query based on filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (project) query.project = project;

    // Filter by user's department if not super admin
    if (req.user.role !== 'super_admin') {
      const projects = await Project.find({ 
        department: req.user.department._id,
        isActive: true 
      }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name department')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.author', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name department')
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email')
      .populate('comments.author', 'name email')
      .populate('watchers', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get time logs for this task
    const timeLogs = await TimeLog.find({ task: task._id })
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json({ ...task.toObject(), timeLogs });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      tags,
      effortEstimate,
      deadline
    } = req.body;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskData = {
      title,
      description,
      project: projectId,
      createdBy: req.user.id,
      priority: priority || 'medium',
      tags: tags || [],
      effortEstimate: effortEstimate || 0
    };

    if (assigneeId) taskData.assignee = assigneeId;
    if (deadline) taskData.deadline = deadline;

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name department')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    const updateFields = [
      'title', 'description', 'status', 'priority', 'tags',
      'effortEstimate', 'deadline', 'assignee'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    // Update project progress
    const project = await Project.findById(task.project);
    if (project) {
      await project.calculateProgress();
      await project.save();
    }

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name department')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.author', 'name email');

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      content: content.trim(),
      author: req.user.id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.author', 'name email');

    res.json(updatedTask.comments[updatedTask.comments.length - 1]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
export const uploadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id
    };

    task.attachments.push(attachment);
    await task.save();

    res.json(attachment);
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: 'Server error uploading attachment' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'developer' && 
        task.createdBy.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Soft delete
    task.isActive = false;
    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { 
      assignee: req.user.id,
      isActive: true 
    };

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('project', 'name department')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error fetching user tasks' });
  }
};