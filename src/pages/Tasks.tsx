import React, { useState } from 'react';
import Header from '../components/layout/Header';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Filter, Search } from 'lucide-react';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { tasks, updateTask, addTask } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my-tasks' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesAssignee = filter === 'all' || 
                           (filter === 'my-tasks' && task.assignee?._id === user?._id) ||
                           (filter !== 'all' && filter !== 'my-tasks' && task.assignee?._id === filter);
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAssignee && matchesStatus && matchesSearch;
  });

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleStatusChange = (taskId: string, status: string) => {
    updateTask(taskId, { status });
  };

  const handleUpdateTask = (taskId: string, updates: any) => {
    updateTask(taskId, updates);
    setSelectedTask((prev: any) => prev ? { ...prev, ...updates } : null);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await addTask(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const myTasksCount = tasks.filter(t => t.assignee?._id === user?._id).length;

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Tasks" 
        subtitle="Manage and track all your tasks"
        actions={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        }
      />
      
      <div className="p-6">
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tasks ({statusCounts.all})</option>
                <option value="my-tasks">My Tasks ({myTasksCount})</option>
              </select>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do ({statusCounts.todo})</option>
              <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
              <option value="review">Review ({statusCounts.review})</option>
              <option value="done">Done ({statusCounts.done})</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEditTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={handleUpdateTask}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;