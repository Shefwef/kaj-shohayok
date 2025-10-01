export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  organizationId?: string;
  roleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  organizationId?: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type Permission =
  | "create:project"
  | "read:project"
  | "update:project"
  | "delete:project"
  | "create:task"
  | "read:task"
  | "update:task"
  | "delete:task"
  | "assign:task"
  | "view:analytics"
  | "manage:users"
  | "manage:roles";

export type RoleName = "admin" | "manager" | "member" | "viewer";

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  organizationId: string;
  ownerId: string;
  teamMembers: string[];
  startDate: Date;
  endDate?: Date;
  progress: number;
  tags: string[];
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  teamMembers: string[];
  startDate: Date;
  endDate?: Date;
  tags: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: "active" | "completed" | "archived";
  progress?: number;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];
  tags: string[];
  attachments: TaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
  estimatedHours?: number;
  dependencies?: string[];
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: "todo" | "in_progress" | "review" | "done";
  actualHours?: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "project_updated"
  | "project_created"
  | "deadline_approaching"
  | "mention"
  | "comment_added";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByPriority: Record<string, number>;
  averageProjectCompletion: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface UserAnalytics {
  activeUsers: number;
  tasksByUser: Array<{
    userId: string;
    userName: string;
    tasksCount: number;
    completedTasks: number;
  }>;
  productivityMetrics: Array<{
    date: string;
    tasksCompleted: number;
    hoursWorked: number;
  }>;
}

export interface DashboardStats {
  projects: ProjectAnalytics;
  tasks: TaskAnalytics;
  users: UserAnalytics;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "project" | "task" | "user";
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProjectFilters {
  status?: "active" | "completed" | "archived";
  priority?: "low" | "medium" | "high" | "critical";
  ownerId?: string;
  teamMember?: string;
  tags?: string[];
  search?: string;
}

export interface TaskFilters {
  status?: "todo" | "in_progress" | "review" | "done";
  priority?: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  projectId?: string;
  overdue?: boolean;
  tags?: string[];
  search?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
