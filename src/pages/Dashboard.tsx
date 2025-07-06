import React from 'react';
import Header from '../components/layout/Header';
import DashboardCards from '../components/dashboard/DashboardCards';
import RecentActivity from '../components/dashboard/RecentActivity';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard: React.FC = () => {
  const { tasks, projects } = useApp();

  const tasksByStatus = [
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Review', count: tasks.filter(t => t.status === 'review').length },
    { name: 'Done', count: tasks.filter(t => t.status === 'done').length }
  ];

  const weeklyProgress = [
    { week: 'Week 1', tasks: 8 },
    { week: 'Week 2', tasks: 12 },
    { week: 'Week 3', tasks: 15 },
    { week: 'Week 4', tasks: 18 }
  ];

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your projects."
      />
      
      <div className="p-6">
        <div className="mb-8">
          <DashboardCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h3>
            <div className="space-y-3">
              {projects.filter(p => p.status === 'in_progress').map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.teamMembers.length} members</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;