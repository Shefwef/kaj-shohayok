import { TaskRepository } from "@/repositories/TaskRepository";
import { ProjectRepository } from "@/repositories/ProjectRepository";
import { AuditService } from "@/services/AuditService";
import { NotificationService } from "@/services/NotificationService";
import { EventBus } from "@/lib/EventBus";
import { logger } from "@/lib/logger";
import { NotFoundError, BusinessError, ForbiddenError } from "@/lib/errors";
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from "@/lib/types";

export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  async getTask(taskId: string, actorId: string): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    return task;
  }

  async getProjectTasks(projectId: string, actorId: string, filters: TaskFilters = {}): Promise<Task[]> {
    const projectIds = await this.projectRepo.findAccessibleIds(actorId);
    if (!projectIds.includes(projectId)) {
      throw new ForbiddenError("Access denied to this project");
    }
    return this.taskRepo.findByProject(projectId, filters);
  }

  async createTask(data: CreateTaskData, actorId: string): Promise<Task> {
    const projectIds = await this.projectRepo.findAccessibleIds(actorId);
    if (!projectIds.includes(data.projectId)) {
      throw new ForbiddenError("Access denied to this project");
    }

    const task = await this.taskRepo.create({ ...data, reporterId: actorId });
    logger.info({ taskId: task._id, actorId }, "Task created");

    await Promise.all([
      this.auditService.log({
        actor: actorId,
        action: "TASK_CREATED",
        target: task._id,
        targetType: "task",
        metadata: { title: task.title },
      }),
      task.assigneeId && task.assigneeId !== actorId
        ? this.notificationService.notifyTaskAssigned(task.assigneeId, task.title, task._id)
        : Promise.resolve(),
      EventBus.publish("task:created", task),
    ]);

    return task;
  }

  async updateTask(taskId: string, data: UpdateTaskData, actorId: string): Promise<Task> {
    const existing = await this.taskRepo.findById(taskId);
    if (!existing) throw new NotFoundError("Task not found");

    const updated = await this.taskRepo.update(taskId, data);
    if (!updated) throw new NotFoundError("Task not found after update");

    logger.info({ taskId, actorId, fields: Object.keys(data) }, "Task updated");

    const sideEffects: Promise<void>[] = [
      this.auditService.log({
        actor: actorId,
        action: "TASK_UPDATED",
        target: taskId,
        targetType: "task",
        metadata: { before: existing, after: data },
      }),
      EventBus.publish("task:updated", updated),
    ];

    if (data.status && data.status !== existing.status && existing.assigneeId) {
      sideEffects.push(
        this.auditService.log({
          actor: actorId,
          action: "TASK_STATUS_CHANGED",
          target: taskId,
          targetType: "task",
          metadata: { from: existing.status, to: data.status },
        }),
        this.notificationService.notifyTaskStatusChanged(
          existing.assigneeId,
          existing.title,
          data.status,
          taskId
        )
      );
    }

    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      sideEffects.push(
        this.auditService.log({
          actor: actorId,
          action: "TASK_ASSIGNED",
          target: taskId,
          targetType: "task",
          metadata: { assigneeId: data.assigneeId },
        }),
        this.notificationService.notifyTaskAssigned(data.assigneeId, existing.title, taskId)
      );
    }

    await Promise.all(sideEffects);
    return updated;
  }

  async deleteTask(taskId: string, actorId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    if (task.status !== "done") {
      // Allow deletion regardless — business rule is simply logged
    }

    await this.taskRepo.delete(taskId);
    logger.info({ taskId, actorId }, "Task deleted");

    await Promise.all([
      this.auditService.log({
        actor: actorId,
        action: "TASK_DELETED",
        target: taskId,
        targetType: "task",
        metadata: { title: task.title },
      }),
      EventBus.publish("task:deleted", { taskId, projectId: task.projectId }),
    ]);
  }

  async assignTask(taskId: string, assigneeId: string, actorId: string): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    if (task.status === "done") {
      throw new BusinessError("Cannot reassign a completed task");
    }

    const updated = await this.taskRepo.update(taskId, { assigneeId });
    if (!updated) throw new NotFoundError("Task update failed");

    await Promise.all([
      this.notificationService.notifyTaskAssigned(assigneeId, task.title, taskId),
      this.auditService.log({
        actor: actorId,
        action: "TASK_ASSIGNED",
        target: taskId,
        targetType: "task",
        metadata: { assigneeId },
      }),
      EventBus.publish("task:assigned", { taskId, assigneeId }),
    ]);

    return updated;
  }
}
