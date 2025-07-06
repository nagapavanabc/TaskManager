import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dashboardAPI, projectsAPI, tasksAPI, timeLogsAPI, departmentsAPI } from '../services/api';

interface Project {
  _id: string;
  name: string;
  description: string;
  department: {
    _id: string;
    name: string;
  };
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  teamMembers: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
  }>;
  tags: string[];
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  project: {
    _id: string;
    name: string;
  };
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  effortEstimate: number;
  actualHours: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  attachments: Array<{
    _id: string;
    name: string;
    originalName: string;
    size: number;
    uploadedAt: string;
  }>;
}

interface TimeLog {
  _id: string;
  task: {
    _id: string;
    title: string;
  };
  project: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  hours: number;
  description: string;
  date: string;
  billable: boolean;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  manager: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'department_manager' | 'team_lead' | 'developer';
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalHours: number;
  teamMembers: number;
  taskStatusBreakdown: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
  };
  projectStatusBreakdown: {
    planning: number;
    in_progress: number;
    on_hold: number;
    completed: number;
  };
}

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  timeLogs: TimeLog[];
  departments: Department[];
  users: User[];
  dashboardStats: DashboardStats | null;
  selectedProject: Project | null;
  isLoading: boolean;
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  refreshData: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTimeLogs: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshDepartments: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  
  // Task actions
  addTask: (taskData: {
    title: string;
    description: string;
    projectId: string;
    assigneeId?: string;
    priority?: string;
    tags?: string[];
    effortEstimate?: number;
    deadline?: string;
  }) => Promise<Task>;
  
  updateTask: (taskId: string, updates: any) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Project actions
  addProject: (projectData: any) => Promise<Project>;
  updateProject: (projectId: string, updates: any) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Department actions
  addDepartment: (departmentData: any) => Promise<Department>;
  updateDepartment: (departmentId: string, updates: any) => Promise<Department>;
  deleteDepartment: (departmentId: string) => Promise<void>;
  
  // Time log actions
  addTimeLog: (timeLogData: {
    taskId: string;
    hours: number;
    description: string;
    date?: string;
    billable?: boolean;
  }) => Promise<TimeLog>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const refreshTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const refreshTimeLogs = async () => {
    try {
      const response = await timeLogsAPI.getAll();
      setTimeLogs(response.data);
    } catch (error) {
      console.error('Error fetching time logs:', error);
    }
  };

  const refreshDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const refreshUsers = async () => {
    try {
      // This would need a users API endpoint
      // For now, we'll extract users from departments
      const deptResponse = await departmentsAPI.getAll();
      const allUsers: User[] = [];
      deptResponse.data.forEach((dept: Department) => {
        dept.members.forEach((member: any) => {
          if (!allUsers.find(u => u._id === member._id)) {
            allUsers.push({
              ...member,
              department: { _id: dept._id, name: dept.name }
            });
          }
        });
      });
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const refreshDashboard = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshDepartments(),
        refreshProjects(),
        refreshTasks(),
        refreshTimeLogs(),
        refreshDashboard()
      ]);
      await refreshUsers(); // After departments are loaded
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    description: string;
    projectId: string;
    assigneeId?: string;
    priority?: string;
    tags?: string[];
    effortEstimate?: number;
    deadline?: string;
  }): Promise<Task> => {
    try {
      const response = await tasksAPI.create(taskData);
      const newTask = response.data;
      setTasks(prev => [newTask, ...prev]);
      await refreshDashboard();
      return newTask;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: any): Promise<Task> => {
    try {
      const response = await tasksAPI.update(taskId, updates);
      const updatedTask = response.data;
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      await refreshDashboard();
      return updatedTask;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      await refreshDashboard();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const addProject = async (projectData: any): Promise<Project> => {
    try {
      const response = await projectsAPI.create(projectData);
      const newProject = response.data;
      setProjects(prev => [newProject, ...prev]);
      await refreshDashboard();
      return newProject;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const updateProject = async (projectId: string, updates: any): Promise<Project> => {
    try {
      const response = await projectsAPI.update(projectId, updates);
      const updatedProject = response.data;
      setProjects(prev => prev.map(project => 
        project._id === projectId ? updatedProject : project
      ));
      await refreshDashboard();
      return updatedProject;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await projectsAPI.delete(projectId);
      setProjects(prev => prev.filter(project => project._id !== projectId));
      await refreshDashboard();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const addDepartment = async (departmentData: any): Promise<Department> => {
    try {
      const response = await departmentsAPI.create(departmentData);
      const newDepartment = response.data;
      setDepartments(prev => [newDepartment, ...prev]);
      return newDepartment;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const updateDepartment = async (departmentId: string, updates: any): Promise<Department> => {
    try {
      const response = await departmentsAPI.update(departmentId, updates);
      const updatedDepartment = response.data;
      setDepartments(prev => prev.map(dept => 
        dept._id === departmentId ? updatedDepartment : dept
      ));
      return updatedDepartment;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const deleteDepartment = async (departmentId: string): Promise<void> => {
    try {
      await departmentsAPI.delete(departmentId);
      setDepartments(prev => prev.filter(dept => dept._id !== departmentId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const addTimeLog = async (timeLogData: {
    taskId: string;
    hours: number;
    description: string;
    date?: string;
    billable?: boolean;
  }): Promise<TimeLog> => {
    try {
      const response = await timeLogsAPI.create(timeLogData);
      const newTimeLog = response.data;
      setTimeLogs(prev => [newTimeLog, ...prev]);
      
      // Update task actual hours
      setTasks(prev => prev.map(task => 
        task._id === timeLogData.taskId 
          ? { ...task, actualHours: task.actualHours + timeLogData.hours }
          : task
      ));
      
      await refreshDashboard();
      return newTimeLog;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to log time');
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppContext.Provider value={{
      projects,
      tasks,
      timeLogs,
      departments,
      users,
      dashboardStats,
      selectedProject,
      isLoading,
      setSelectedProject,
      refreshData,
      refreshTasks,
      refreshProjects,
      refreshTimeLogs,
      refreshDashboard,
      refreshDepartments,
      refreshUsers,
      addTask,
      updateTask,
      deleteTask,
      addProject,
      updateProject,
      deleteProject,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addTimeLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};