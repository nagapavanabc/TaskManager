import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    departmentId?: string;
  }) => api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/auth/profile', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getUserDashboard: () => api.get('/dashboard/user'),
  getTeamDashboard: () => api.get('/dashboard/team'),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: {
    name: string;
    description?: string;
    managerId: string;
  }) => api.post('/departments', data),
  
  update: (id: string, data: {
    name?: string;
    description?: string;
    managerId?: string;
  }) => api.put(`/departments/${id}`, data),
  
  delete: (id: string) => api.delete(`/departments/${id}`),
  
  addMember: (id: string, userId: string) =>
    api.post(`/departments/${id}/members`, { userId }),
  
  removeMember: (id: string, userId: string) =>
    api.delete(`/departments/${id}/members/${userId}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  getStats: (id: string) => api.get(`/projects/${id}/stats`),
  
  create: (data: {
    name: string;
    description: string;
    departmentId?: string;
    startDate: string;
    endDate?: string;
    estimatedHours?: number;
    priority?: string;
    teamMembers?: Array<{ userId: string; role: string }>;
    tags?: string[];
  }) => api.post('/projects', data),
  
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    assignee?: string;
    project?: string;
  }) => api.get('/tasks', { params }),
  
  getById: (id: string) => api.get(`/tasks/${id}`),
  getMyTasks: (status?: string) => 
    api.get('/tasks/my-tasks', { params: { status } }),
  
  create: (data: {
    title: string;
    description: string;
    projectId: string;
    assigneeId?: string;
    priority?: string;
    tags?: string[];
    effortEstimate?: number;
    deadline?: string;
  }) => api.post('/tasks', data),
  
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  
  addComment: (id: string, content: string) =>
    api.post(`/tasks/${id}/comments`, { content }),
  
  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Time Logs API
export const timeLogsAPI = {
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    taskId?: string;
    projectId?: string;
    userId?: string;
  }) => api.get('/time-logs', { params }),
  
  getStats: (params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) => api.get('/time-logs/stats', { params }),
  
  create: (data: {
    taskId: string;
    hours: number;
    description: string;
    date?: string;
    billable?: boolean;
  }) => api.post('/time-logs', data),
  
  update: (id: string, data: {
    hours?: number;
    description?: string;
    date?: string;
    billable?: boolean;
  }) => api.put(`/time-logs/${id}`, data),
  
  delete: (id: string) => api.delete(`/time-logs/${id}`),
};

export default api;