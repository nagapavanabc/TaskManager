import Task from '../models/Task.js';
import Project from '../models/Project.js';
import TimeLog from '../models/TimeLog.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    let projectQuery = { isActive: true };
    let taskQuery = { isActive: true };
    let timeLogQuery = {};

    // Filter by department if not super admin
    if (req.user.role !== 'super_admin') {
      projectQuery.department = req.user.department._id;
      
      const projects = await Project.find(projectQuery).select('_id');
      const projectIds = projects.map(p => p._id);
      taskQuery.project = { $in: projectIds };
      timeLogQuery.project = { $in: projectIds };
    }

    // Get basic counts
    const [totalTasks, totalProjects, totalUsers] = await Promise.all([
      Task.countDocuments(taskQuery),
      Project.countDocuments(projectQuery),
      User.countDocuments({ isActive: true })
    ]);

    // Get task status breakdown
    const taskStats = await Task.aggregate([
      { $match: taskQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const taskStatusCounts = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0
    };

    taskStats.forEach(stat => {
      taskStatusCounts[stat._id] = stat.count;
    });

    // Get project status breakdown
    const projectStats = await Project.aggregate([
      { $match: projectQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const projectStatusCounts = {
      planning: 0,
      in_progress: 0,
      on_hold: 0,
      completed: 0
    };

    projectStats.forEach(stat => {
      projectStatusCounts[stat._id] = stat.count;
    });

    // Get time log stats for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const timeLogStats = await TimeLog.aggregate([
      {
        $match: {
          ...timeLogQuery,
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    const totalHours = timeLogStats[0]?.totalHours || 0;

    // Get recent activity
    const recentTasks = await Task.find(taskQuery)
      .populate('assignee', 'name')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentTimeLogs = await TimeLog.find(timeLogQuery)
      .populate('user', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalTasks,
      completedTasks: taskStatusCounts.done,
      inProgressTasks: taskStatusCounts.in_progress,
      todoTasks: taskStatusCounts.todo,
      reviewTasks: taskStatusCounts.review,
      totalProjects,
      activeProjects: projectStatusCounts.in_progress,
      completedProjects: projectStatusCounts.completed,
      totalHours: Math.round(totalHours * 10) / 10,
      teamMembers: totalUsers,
      taskStatusBreakdown: taskStatusCounts,
      projectStatusBreakdown: projectStatusCounts,
      recentActivity: {
        tasks: recentTasks,
        timeLogs: recentTimeLogs
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
};

// @desc    Get user dashboard
// @route   GET /api/dashboard/user
// @access  Private
export const getUserDashboard = async (req, res) => {
  try {
    // Get user's tasks
    const myTasks = await Task.find({
      assignee: req.user.id,
      isActive: true
    })
      .populate('project', 'name')
      .sort({ deadline: 1 });

    // Get user's time logs for current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyTimeLogs = await TimeLog.find({
      user: req.user.id,
      date: { $gte: startOfWeek }
    })
      .populate('task', 'title')
      .populate('project', 'name')
      .sort({ date: -1 });

    // Calculate weekly hours
    const weeklyHours = weeklyTimeLogs.reduce((sum, log) => sum + log.hours, 0);

    // Get overdue tasks
    const overdueTasks = await Task.find({
      assignee: req.user.id,
      deadline: { $lt: new Date() },
      status: { $ne: 'done' },
      isActive: true
    }).populate('project', 'name');

    // Get task status breakdown for user
    const myTaskStats = await Task.aggregate([
      {
        $match: {
          assignee: mongoose.Types.ObjectId(req.user.id),
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const myTaskStatusCounts = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0
    };

    myTaskStats.forEach(stat => {
      myTaskStatusCounts[stat._id] = stat.count;
    });

    const userDashboard = {
      myTasks: myTasks.slice(0, 10), // Limit to 10 most recent
      weeklyTimeLogs,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      overdueTasks,
      taskStatusBreakdown: myTaskStatusCounts,
      totalMyTasks: myTasks.length,
      completedThisWeek: weeklyTimeLogs.filter(log => 
        log.task && myTasks.some(task => 
          task._id.toString() === log.task._id.toString() && task.status === 'done'
        )
      ).length
    };

    res.json(userDashboard);
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching user dashboard' });
  }
};

// @desc    Get team dashboard
// @route   GET /api/dashboard/team
// @access  Private (Team Lead and above)
export const getTeamDashboard = async (req, res) => {
  try {
    if (!['team_lead', 'department_manager', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let userQuery = { isActive: true };
    let projectQuery = { isActive: true };

    // Filter by department
    if (req.user.role !== 'super_admin') {
      userQuery.department = req.user.department._id;
      projectQuery.department = req.user.department._id;
    }

    // Get team members
    const teamMembers = await User.find(userQuery).select('name email role');

    // Get team projects
    const teamProjects = await Project.find(projectQuery)
      .populate('teamMembers.user', 'name email')
      .sort({ updatedAt: -1 });

    // Get team performance metrics
    const teamStats = await TimeLog.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $match: {
          'userInfo.department': req.user.department._id,
          date: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: '$user',
          totalHours: { $sum: '$hours' },
          totalEntries: { $sum: 1 },
          userName: { $first: { $arrayElemAt: ['$userInfo.name', 0] } }
        }
      },
      {
        $sort: { totalHours: -1 }
      }
    ]);

    const teamDashboard = {
      teamMembers,
      teamProjects: teamProjects.slice(0, 5),
      teamPerformance: teamStats,
      totalTeamMembers: teamMembers.length,
      activeProjects: teamProjects.filter(p => p.status === 'in_progress').length
    };

    res.json(teamDashboard);
  } catch (error) {
    console.error('Get team dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching team dashboard' });
  }
};