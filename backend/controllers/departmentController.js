import Department from '../models/Department.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('manager', 'name email')
      .populate('members', 'name email role')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error fetching department' });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Super Admin only)
export const createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, managerId } = req.body;

    // Check if department name already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    // Verify manager exists and has appropriate role
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(400).json({ message: 'Manager not found' });
    }

    if (!['super_admin', 'department_manager'].includes(manager.role)) {
      return res.status(400).json({ message: 'User must be a manager or admin' });
    }

    const department = await Department.create({
      name,
      description,
      manager: managerId,
      members: [managerId]
    });

    // Update manager's department
    manager.department = department._id;
    await manager.save();

    const populatedDepartment = await Department.findById(department._id)
      .populate('manager', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populatedDepartment);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error creating department' });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Super Admin or Department Manager)
export const updateDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, managerId } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check authorization
    if (req.user.role !== 'super_admin' && 
        department.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this department' });
    }

    // Update fields
    department.name = name || department.name;
    department.description = description || department.description;

    if (managerId && managerId !== department.manager.toString()) {
      const newManager = await User.findById(managerId);
      if (!newManager) {
        return res.status(400).json({ message: 'New manager not found' });
      }
      
      if (!['super_admin', 'department_manager'].includes(newManager.role)) {
        return res.status(400).json({ message: 'User must be a manager or admin' });
      }

      department.manager = managerId;
      
      // Update manager's department
      newManager.department = department._id;
      await newManager.save();
    }

    await department.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate('manager', 'name email')
      .populate('members', 'name email role');

    res.json(updatedDepartment);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error updating department' });
  }
};

// @desc    Add member to department
// @route   POST /api/departments/:id/members
// @access  Private (Super Admin or Department Manager)
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (department.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this department' });
    }

    department.members.push(userId);
    await department.save();

    // Update user's department
    user.department = department._id;
    await user.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate('manager', 'name email')
      .populate('members', 'name email role');

    res.json(updatedDepartment);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
};

// @desc    Remove member from department
// @route   DELETE /api/departments/:id/members/:userId
// @access  Private (Super Admin or Department Manager)
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Cannot remove the manager
    if (department.manager.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove department manager' });
    }

    department.members = department.members.filter(
      member => member.toString() !== userId
    );
    await department.save();

    // Update user's department
    const user = await User.findById(userId);
    if (user) {
      user.department = undefined;
      await user.save();
    }

    const updatedDepartment = await Department.findById(department._id)
      .populate('manager', 'name email')
      .populate('members', 'name email role');

    res.json(updatedDepartment);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
};