import { AuditRepository, AuditAction, AuditEntry } from "@/repositories/AuditRepository";
import { logger } from "@/lib/logger";

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(
    entry: Omit<AuditEntry, "timestamp">
  ): Promise<void> {
    try {
      await this.auditRepo.append({ ...entry, timestamp: new Date() });
    } catch (error) {
      logger.error({ err: error, entry }, "Failed to write audit log");
    }
  }

  async getTaskHistory(taskId: string): Promise<AuditEntry[]> {
    return this.auditRepo.findByTarget(taskId);
  }

  async getProjectHistory(projectId: string): Promise<AuditEntry[]> {
    return this.auditRepo.findByTarget(projectId);
  }

  async getUserActivity(userId: string): Promise<AuditEntry[]> {
    return this.auditRepo.findByActor(userId);
  }

  async getReport(from: Date, to: Date): Promise<AuditEntry[]> {
    return this.auditRepo.findByDateRange(from, to);
  }
}
