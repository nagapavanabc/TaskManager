import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TimeLog from '../models/TimeLog.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await TimeLog.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'John Admin',
        email: 'admin@company.com',
        password: 'password',
        role: 'super_admin'
      },
      {
        name: 'Sarah Manager',
        email: 'manager@company.com',
        password: 'password',
        role: 'department_manager'
      },
      {
        name: 'Mike Lead',
        email: 'lead@company.com',
        password: 'password',
        role: 'team_lead'
      },
      {
        name: 'Lisa Developer',
        email: 'dev@company.com',
        password: 'password',
        role: 'developer'
      },
      {
        name: 'Alex Designer',
        email: 'designer@company.com',
        password: 'password',
        role: 'developer'
      }
    ]);

    console.log('Created users');

    // Create departments
    const departments = await Department.create([
      {
        name: 'Engineering',
        description: 'Software development and technical operations',
        manager: users[1]._id,
        members: [users[1]._id, users[2]._id, users[3]._id]
      },
      {
        name: 'Design',
        description: 'User experience and visual design',
        manager: users[1]._id,
        members: [users[1]._id, users[4]._id]
      }
    ]);

    console.log('Created departments');

    // Update users with departments
    await User.findByIdAndUpdate(users[1]._id, { department: departments[0]._id });
    await User.findByIdAndUpdate(users[2]._id, { department: departments[0]._id });
    await User.findByIdAndUpdate(users[3]._id, { department: departments[0]._id });
    await User.findByIdAndUpdate(users[4]._id, { department: departments[1]._id });

    // Create projects
    const projects = await Project.create([
      {
        name: 'Customer Portal Redesign',
        description: 'Complete redesign of the customer portal interface with modern UI/UX',
        department: departments[0]._id,
        status: 'in_progress',
        priority: 'high',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        estimatedHours: 320,
        actualHours: 180,
        progress: 65,
        teamMembers: [
          { user: users[2]._id, role: 'project_manager' },
          { user: users[3]._id, role: 'developer' },
          { user: users[4]._id, role: 'designer' }
        ],
        createdBy: users[1]._id,
        tags: ['frontend', 'ui/ux', 'react']
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        department: departments[0]._id,
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        estimatedHours: 480,
        actualHours: 24,
        progress: 10,
        teamMembers: [
          { user: users[3]._id, role: 'developer' },
          { user: users[4]._id, role: 'designer' }
        ],
        createdBy: users[1]._id,
        tags: ['mobile', 'react-native', 'ios', 'android']
      },
      {
        name: 'API Modernization',
        description: 'Upgrade legacy APIs to modern REST architecture',
        department: departments[0]._id,
        status: 'in_progress',
        priority: 'urgent',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        estimatedHours: 240,
        actualHours: 160,
        progress: 75,
        teamMembers: [
          { user: users[2]._id, role: 'team_lead' },
          { user: users[3]._id, role: 'developer' }
        ],
        createdBy: users[1]._id,
        tags: ['backend', 'api', 'nodejs', 'mongodb']
      }
    ]);

    console.log('Created projects');

    // Create tasks
    const tasks = await Task.create([
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and prototypes for the login and registration process including password reset functionality',
        project: projects[0]._id,
        assignee: users[4]._id,
        createdBy: users[2]._id,
        status: 'in_progress',
        priority: 'high',
        tags: ['design', 'ux', 'authentication'],
        effortEstimate: 16,
        actualHours: 8,
        deadline: new Date('2024-03-15'),
        startDate: new Date('2024-02-01')
      },
      {
        title: 'Implement user API endpoints',
        description: 'Create RESTful API endpoints for user management including CRUD operations and authentication',
        project: projects[0]._id,
        assignee: users[3]._id,
        createdBy: users[2]._id,
        status: 'todo',
        priority: 'medium',
        tags: ['backend', 'api', 'nodejs'],
        effortEstimate: 12,
        actualHours: 0,
        deadline: new Date('2024-03-20')
      },
      {
        title: 'Setup database schema',
        description: 'Design and implement the database schema for user data with proper indexing and relationships',
        project: projects[0]._id,
        assignee: users[3]._id,
        createdBy: users[2]._id,
        status: 'done',
        priority: 'high',
        tags: ['database', 'backend', 'mongodb'],
        effortEstimate: 8,
        actualHours: 6,
        deadline: new Date('2024-02-28'),
        startDate: new Date('2024-01-25'),
        completedDate: new Date('2024-02-15')
      },
      {
        title: 'Create responsive dashboard layout',
        description: 'Implement responsive dashboard layout with sidebar navigation and main content area',
        project: projects[0]._id,
        assignee: users[3]._id,
        createdBy: users[2]._id,
        status: 'review',
        priority: 'medium',
        tags: ['frontend', 'react', 'css'],
        effortEstimate: 20,
        actualHours: 18,
        deadline: new Date('2024-03-10')
      },
      {
        title: 'Mobile app wireframes',
        description: 'Create detailed wireframes for all mobile app screens including user flows',
        project: projects[1]._id,
        assignee: users[4]._id,
        createdBy: users[1]._id,
        status: 'in_progress',
        priority: 'high',
        tags: ['design', 'mobile', 'wireframes'],
        effortEstimate: 24,
        actualHours: 12,
        deadline: new Date('2024-03-01')
      },
      {
        title: 'API documentation update',
        description: 'Update API documentation with new endpoints and authentication methods',
        project: projects[2]._id,
        assignee: users[2]._id,
        createdBy: users[1]._id,
        status: 'todo',
        priority: 'low',
        tags: ['documentation', 'api'],
        effortEstimate: 6,
        actualHours: 0,
        deadline: new Date('2024-03-25')
      }
    ]);

    console.log('Created tasks');

    // Create time logs
    const timeLogs = await TimeLog.create([
      {
        task: tasks[0]._id,
        project: projects[0]._id,
        user: users[4]._id,
        hours: 4,
        description: 'Created initial wireframes for login flow',
        date: new Date('2024-02-10'),
        billable: true
      },
      {
        task: tasks[0]._id,
        project: projects[0]._id,
        user: users[4]._id,
        hours: 4,
        description: 'Refined authentication flow and added password reset',
        date: new Date('2024-02-11'),
        billable: true
      },
      {
        task: tasks[2]._id,
        project: projects[0]._id,
        user: users[3]._id,
        hours: 3,
        description: 'Designed user schema and relationships',
        date: new Date('2024-02-05'),
        billable: true
      },
      {
        task: tasks[2]._id,
        project: projects[0]._id,
        user: users[3]._id,
        hours: 3,
        description: 'Implemented schema and added indexes',
        date: new Date('2024-02-06'),
        billable: true
      },
      {
        task: tasks[3]._id,
        project: projects[0]._id,
        user: users[3]._id,
        hours: 8,
        description: 'Built responsive sidebar and navigation',
        date: new Date('2024-02-12'),
        billable: true
      },
      {
        task: tasks[3]._id,
        project: projects[0]._id,
        user: users[3]._id,
        hours: 6,
        description: 'Implemented main dashboard layout',
        date: new Date('2024-02-13'),
        billable: true
      },
      {
        task: tasks[3]._id,
        project: projects[0]._id,
        user: users[3]._id,
        hours: 4,
        description: 'Added responsive breakpoints and mobile optimization',
        date: new Date('2024-02-14'),
        billable: true
      },
      {
        task: tasks[4]._id,
        project: projects[1]._id,
        user: users[4]._id,
        hours: 6,
        description: 'Created user onboarding wireframes',
        date: new Date('2024-02-08'),
        billable: true
      },
      {
        task: tasks[4]._id,
        project: projects[1]._id,
        user: users[4]._id,
        hours: 6,
        description: 'Designed main app navigation and screens',
        date: new Date('2024-02-09'),
        billable: true
      }
    ]);

    console.log('Created time logs');

    console.log('✅ Seed data created successfully!');
    console.log('\nDemo Accounts:');
    console.log('Super Admin: admin@company.com / password');
    console.log('Department Manager: manager@company.com / password');
    console.log('Team Lead: lead@company.com / password');
    console.log('Developer: dev@company.com / password');
    console.log('Designer: designer@company.com / password');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();