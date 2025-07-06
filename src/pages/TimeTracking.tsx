import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { useApp } from '../contexts/AppContext';
import { Clock, Play, Pause, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const TimeTracking: React.FC = () => {
  const { timeLogs, tasks, addTimeLog } = useApp();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');

  const handleStartTracking = () => {
    setIsTracking(true);
    setCurrentTime(0);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    if (selectedTask && description && currentTime > 0) {
      addTimeLog({
        taskId: selectedTask,
        userId: '1', // Current user
        hours: currentTime / 3600, // Convert seconds to hours
        description,
        date: new Date()
      });
      setCurrentTime(0);
      setDescription('');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const todayLogs = timeLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const totalHoursToday = todayLogs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Time Tracking" 
        subtitle="Track time spent on tasks and projects"
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracker</h3>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
                  {formatTime(currentTime)}
                </div>
                <div className="flex justify-center gap-3">
                  {!isTracking ? (
                    <button
                      onClick={handleStartTracking}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTracking}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Pause className="w-5 h-5" />
                      Stop
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Task
                  </label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a task...</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you work on?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Logs</h3>
              <div className="space-y-3">
                {timeLogs.slice(0, 10).map((log) => {
                  const task = tasks.find(t => t.id === log.taskId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task?.title || 'Unknown Task'}</h4>
                        <p className="text-sm text-gray-600">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(log.date, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {log.hours}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="text-lg font-bold text-gray-900">{totalHoursToday.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Entries</span>
                  <span className="text-lg font-bold text-gray-900">{todayLogs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Worked On</span>
                  <span className="text-lg font-bold text-gray-900">
                    {new Set(todayLogs.map(log => log.taskId)).size}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Manual Entry
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5" />
                  View Weekly Report
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Clock className="w-5 h-5" />
                  Export Timesheet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;