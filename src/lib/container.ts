import { TaskRepository } from "@/repositories/TaskRepository";
import { ProjectRepository } from "@/repositories/ProjectRepository";
import { AuditRepository } from "@/repositories/AuditRepository";
import { AuditService } from "@/services/AuditService";
import { NotificationService } from "@/services/NotificationService";
import { TaskService } from "@/services/TaskService";

// Singleton repositories
export const taskRepo = new TaskRepository();
export const projectRepo = new ProjectRepository();
export const auditRepo = new AuditRepository();

// Singleton services (inject via constructor)
export const auditService = new AuditService(auditRepo);
export const notificationService = new NotificationService();

export const taskService = new TaskService(
  taskRepo,
  projectRepo,
  auditService,
  notificationService
);
