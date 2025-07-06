import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const ReportsView: React.FC = () => {
  const { tasks, timeLogs, projects, users } = useApp();
  const [dateRange, setDateRange] = useState('week');
  const [selectedUser, setSelectedUser] = useState('all');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const { start, end } = getDateRange();

  const filteredTimeLogs = timeLogs.filter(log => {
    const logDate = new Date(log.date);
    const inRange = logDate >= start && logDate <= end;
    const userMatch = selectedUser === 'all' || log.user._id === selectedUser;
    return inRange && userMatch;
  });

  // Task completion data
  const taskCompletionData = [
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#6B7280' },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Review', count: tasks.filter(t => t.status === 'review').length, color: '#8B5CF6' },
    { name: 'Done', count: tasks.filter(t => t.status === 'done').length, color: '#10B981' }
  ];

  // Time tracking by user
  const timeByUser = users.map(user => {
    const userLogs = filteredTimeLogs.filter(log => log.user._id === user._id);
    const totalHours = userLogs.reduce((sum, log) => sum + log.hours, 0);
    return {
      name: user.name,
      hours: totalHours,
      entries: userLogs.length
    };
  }).filter(data => data.hours > 0);

  // Project progress
  const projectProgressData = projects.map(project => ({
    name: project.name,
    progress: project.progress,
    estimated: project.estimatedHours,
    actual: project.actualHours
  }));

  // Effort vs Actual comparison
  const effortComparisonData = projects.map(project => {
    const projectTasks = tasks.filter(task => task.project._id === project._id);
    const totalEstimated = projectTasks.reduce((sum, task) => sum + task.effortEstimate, 0);
    const totalActual = projectTasks.reduce((sum, task) => sum + task.actualHours, 0);
    
    return {
      project: project.name,
      estimated: totalEstimated,
      actual: totalActual
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Hours Logged</h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredTimeLogs.reduce((sum, log) => sum + log.hours, 0).toFixed(1)}h
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tasks Completed</h3>
          <p className="text-2xl font-bold text-gray-900">
            {tasks.filter(t => t.status === 'done').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Projects</h3>
          <p className="text-2xl font-bold text-gray-900">
            {projects.filter(p => p.status === 'in_progress').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Team Members</h3>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskCompletionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ name, count }) => `${name}: ${count}`}
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time Tracking by User */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Logged by User</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeByUser}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Effort vs Actual Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated vs Actual Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={effortComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="estimated" fill="#F59E0B" name="Estimated" />
              <Bar dataKey="actual" fill="#EF4444" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Log Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Task</th>
                  <th className="text-left py-2">Hours</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimeLogs.slice(0, 10).map((log) => (
                  <tr key={log._id} className="border-b border-gray-100">
                    <td className="py-2">{log.user.name}</td>
                    <td className="py-2">{log.task.title}</td>
                    <td className="py-2">{log.hours}h</td>
                    <td className="py-2">{format(new Date(log.date), 'MMM dd')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Completion Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Summary</h3>
          <div className="space-y-3">
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.project._id === project._id);
              const completedTasks = projectTasks.filter(task => task.status === 'done').length;
              const totalTasks = projectTasks.length;
              const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

              return (
                <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">
                      {completedTasks}/{totalTasks} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {completionRate.toFixed(0)}%
                    </span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-green-600 rounded-full" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;