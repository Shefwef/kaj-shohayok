import connectMongoDB from "@/lib/db/mongodb";
import mongoose, { Schema, Document } from "mongoose";

export type AuditAction =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "ROLE_CHANGED"
  | "USER_INVITED"
  | "COMMENT_ADDED";

export interface AuditEntry {
  actor: string;
  action: AuditAction;
  target: string;
  targetType: "task" | "project" | "user" | "role";
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

interface IAuditLog extends Document, AuditEntry {}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    targetType: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
    collection: "audit_logs_v2",
  }
);

AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.index({ target: 1 });
AuditLogSchema.index({ action: 1 });

const AuditLog =
  mongoose.models.AuditLogV2 ||
  mongoose.model<IAuditLog>("AuditLogV2", AuditLogSchema);

export class AuditRepository {
  async append(entry: AuditEntry): Promise<void> {
    await connectMongoDB();
    await AuditLog.create(entry);
  }

  async findByTarget(targetId: string, limit = 20): Promise<AuditEntry[]> {
    await connectMongoDB();
    const logs = await AuditLog.find({ target: targetId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return logs as unknown as AuditEntry[];
  }

  async findByActor(actorId: string, limit = 50): Promise<AuditEntry[]> {
    await connectMongoDB();
    const logs = await AuditLog.find({ actor: actorId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return logs as unknown as AuditEntry[];
  }

  async findByDateRange(from: Date, to: Date): Promise<AuditEntry[]> {
    await connectMongoDB();
    const logs = await AuditLog.find({
      timestamp: { $gte: from, $lte: to },
    })
      .sort({ timestamp: -1 })
      .lean();
    return logs as unknown as AuditEntry[];
  }
}
