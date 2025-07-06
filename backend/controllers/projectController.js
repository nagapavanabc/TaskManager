import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Filter by department if user is not super admin
    if (req.user.role !== 'super_admin') {
      query.department = req.user.department._id;
    }

    const projects = await Project.find(query)
      .populate('department', 'name')
      .populate('teamMembers.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('department', 'name')
      .populate('teamMembers.user', 'name email role')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project tasks
    const tasks = await Task.find({ project: project._id, isActive: true })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Department Manager and above)
export const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      departmentId,
      startDate,
      endDate,
      estimatedHours,
      priority,
      teamMembers,
      tags
    } = req.body;

    const projectData = {
      name,
      description,
      department: departmentId || req.user.department._id,
      startDate,
      endDate,
      estimatedHours: estimatedHours || 0,
      priority: priority || 'medium',
      createdBy: req.user.id,
      tags: tags || []
    };

    // Add team members
    if (teamMembers && teamMembers.length > 0) {
      projectData.teamMembers = teamMembers.map(member => ({
        user: member.userId,
        role: member.role || 'developer'
      }));
    }

    const project = await Project.create(projectData);

    const populatedProject = await Project.findById(project._id)
      .populate('department', 'name')
      .populate('teamMembers.user', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Project team members and above)
export const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isTeamMember = project.teamMembers.some(
      member => member.user.toString() === req.user.id
    );
    
    if (req.user.role === 'developer' && !isTeamMember) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update fields
    const updateFields = [
      'name', 'description', 'status', 'priority', 'startDate', 
      'endDate', 'estimatedHours', 'tags'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    // Update team members if provided
    if (req.body.teamMembers) {
      project.teamMembers = req.body.teamMembers.map(member => ({
        user: member.userId,
        role: member.role || 'developer'
      }));
    }

    // Recalculate progress
    await project.calculateProgress();
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('department', 'name')
      .populate('teamMembers.user', 'name email')
      .populate('createdBy', 'name email');

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Department Manager and above)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Soft delete
    project.isActive = false;
    await project.save();

    // Also soft delete all tasks in this project
    await Task.updateMany(
      { project: project._id },
      { isActive: false }
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id, isActive: true });
    
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      reviewTasks: tasks.filter(t => t.status === 'review').length,
      totalEstimatedHours: tasks.reduce((sum, task) => sum + task.effortEstimate, 0),
      totalActualHours: tasks.reduce((sum, task) => sum + task.actualHours, 0),
      overdueTasks: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Server error fetching project statistics' });
  }
};