import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).populate('department');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

export const checkDepartmentAccess = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    
    // Super admin has access to all departments
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Department manager has access to their own department
    if (req.user.role === 'department_manager' && req.user.department._id.toString() === departmentId) {
      return next();
    }
    
    // Team leads and developers have access to their department
    if (['team_lead', 'developer'].includes(req.user.role) && req.user.department._id.toString() === departmentId) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied to this department' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking department access' });
  }
};