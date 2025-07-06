import React from 'react';
import Header from '../components/layout/Header';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Mail, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Team: React.FC = () => {
  const { user } = useAuth();
  const { users, tasks, timeLogs } = useApp();

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignee?._id === userId);
    const userTimeLogs = timeLogs.filter(log => log.user._id === userId);
    const totalHours = userTimeLogs.reduce((sum, log) => sum + log.hours, 0);
    
    return {
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter(task => task.status === 'done').length,
      inProgressTasks: userTasks.filter(task => task.status === 'in_progress').length,
      totalHours: totalHours
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'department_manager':
        return 'bg-blue-100 text-blue-800';
      case 'team_lead':
        return 'bg-green-100 text-green-800';
      case 'developer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Team" 
        subtitle="View team members and their performance"
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((teamMember) => {
            const stats = getUserStats(teamMember._id);
            
            return (
              <div key={teamMember._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {teamMember.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{teamMember.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{teamMember.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(teamMember.role)}`}>
                      {formatRole(teamMember.role)}
                    </span>
                  </div>

                  {teamMember.department && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm font-medium text-gray-900">
                        {teamMember.department.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.totalTasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.completedTasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-sm font-medium text-blue-600">
                      {stats.inProgressTasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hours Logged</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {stats.totalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(teamMember.createdAt), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {stats.totalTasks > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Task Completion</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600">Team members will appear here once they join departments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;