import TimeLog from '../models/TimeLog.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { validationResult } from 'express-validator';

// @desc    Get time logs
// @route   GET /api/time-logs
// @access  Private
export const getTimeLogs = async (req, res) => {
  try {
    const { startDate, endDate, taskId, projectId, userId } = req.query;
    let query = {};

    // Build query based on filters
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (taskId) query.task = taskId;
    if (projectId) query.project = projectId;
    if (userId) query.user = userId;

    // Filter by user's access level
    if (req.user.role === 'developer') {
      query.user = req.user.id;
    } else if (req.user.role !== 'super_admin') {
      // Get projects in user's department
      const projects = await Project.find({ 
        department: req.user.department._id 
      }).select('_id');
      query.project = { $in: projects.map(p => p._id) };
    }

    const timeLogs = await TimeLog.find(query)
      .populate('task', 'title')
      .populate('project', 'name')
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json(timeLogs);
  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ message: 'Server error fetching time logs' });
  }
};

// @desc    Create time log
// @route   POST /api/time-logs
// @access  Private
export const createTimeLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, hours, description, date, billable } = req.body;

    // Verify task exists
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const timeLog = await TimeLog.create({
      task: taskId,
      project: task.project._id,
      user: req.user.id,
      hours,
      description,
      date: date || new Date(),
      billable: billable !== undefined ? billable : true
    });

    // Update task actual hours
    task.actualHours += hours;
    await task.save();

    // Update project actual hours
    const project = await Project.findById(task.project._id);
    if (project) {
      project.actualHours += hours;
      await project.save();
    }

    const populatedTimeLog = await TimeLog.findById(timeLog._id)
      .populate('task', 'title')
      .populate('project', 'name')
      .populate('user', 'name email');

    res.status(201).json(populatedTimeLog);
  } catch (error) {
    console.error('Create time log error:', error);
    res.status(500).json({ message: 'Server error creating time log' });
  }
};

// @desc    Update time log
// @route   PUT /api/time-logs/:id
// @access  Private
export const updateTimeLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Check authorization
    if (req.user.role === 'developer' && timeLog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this time log' });
    }

    const oldHours = timeLog.hours;
    const { hours, description, date, billable } = req.body;

    // Update fields
    if (hours !== undefined) timeLog.hours = hours;
    if (description !== undefined) timeLog.description = description;
    if (date !== undefined) timeLog.date = date;
    if (billable !== undefined) timeLog.billable = billable;

    await timeLog.save();

    // Update task and project hours if hours changed
    if (hours !== undefined && hours !== oldHours) {
      const hoursDiff = hours - oldHours;
      
      const task = await Task.findById(timeLog.task);
      if (task) {
        task.actualHours += hoursDiff;
        await task.save();
      }

      const project = await Project.findById(timeLog.project);
      if (project) {
        project.actualHours += hoursDiff;
        await project.save();
      }
    }

    const updatedTimeLog = await TimeLog.findById(timeLog._id)
      .populate('task', 'title')
      .populate('project', 'name')
      .populate('user', 'name email');

    res.json(updatedTimeLog);
  } catch (error) {
    console.error('Update time log error:', error);
    res.status(500).json({ message: 'Server error updating time log' });
  }
};

// @desc    Delete time log
// @route   DELETE /api/time-logs/:id
// @access  Private
export const deleteTimeLog = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Check authorization
    if (req.user.role === 'developer' && timeLog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this time log' });
    }

    // Update task and project hours
    const task = await Task.findById(timeLog.task);
    if (task) {
      task.actualHours = Math.max(0, task.actualHours - timeLog.hours);
      await task.save();
    }

    const project = await Project.findById(timeLog.project);
    if (project) {
      project.actualHours = Math.max(0, project.actualHours - timeLog.hours);
      await project.save();
    }

    await TimeLog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Time log deleted successfully' });
  } catch (error) {
    console.error('Delete time log error:', error);
    res.status(500).json({ message: 'Server error deleting time log' });
  }
};

// @desc    Get time log statistics
// @route   GET /api/time-logs/stats
// @access  Private
export const getTimeLogStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (userId) {
      matchQuery.user = mongoose.Types.ObjectId(userId);
    } else if (req.user.role === 'developer') {
      matchQuery.user = mongoose.Types.ObjectId(req.user.id);
    }

    const stats = await TimeLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalEntries: { $sum: 1 },
          billableHours: {
            $sum: {
              $cond: [{ $eq: ['$billable', true] }, '$hours', 0]
            }
          },
          averageHoursPerDay: { $avg: '$hours' }
        }
      }
    ]);

    const result = stats[0] || {
      totalHours: 0,
      totalEntries: 0,
      billableHours: 0,
      averageHoursPerDay: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get time log stats error:', error);
    res.status(500).json({ message: 'Server error fetching time log statistics' });
  }
};