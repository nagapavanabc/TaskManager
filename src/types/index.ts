export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'super_admin' | 'department_manager' | 'team_lead' | 'developer';
  departmentId?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberCount: number;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  startDate: Date;
  endDate?: Date;
  progress: number;
  teamMembers: string[];
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  createdById: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  effortEstimate: number;
  actualHours: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  attachments: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  description: string;
  date: Date;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalProjects: number;
  activeProjects: number;
  totalHours: number;
  teamMembers: number;
}