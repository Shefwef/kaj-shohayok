import connectMongoDB from "@/lib/db/mongodb";
import Notification from "@/models/Notification";
import { logger } from "@/lib/logger";

interface NotifyPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  async notify(payload: NotifyPayload): Promise<void> {
    try {
      await connectMongoDB();
      await Notification.create({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data ?? {},
        read: false,
      });
      logger.info({ userId: payload.userId, type: payload.type }, "Notification created");
    } catch (error) {
      logger.error({ err: error, payload }, "Failed to create notification");
    }
  }

  async notifyTaskAssigned(assigneeId: string, taskTitle: string, taskId: string): Promise<void> {
    await this.notify({
      userId: assigneeId,
      type: "task_assigned",
      title: "Task Assigned",
      message: `You have been assigned to: ${taskTitle}`,
      data: { taskId },
    });
  }

  async notifyTaskStatusChanged(assigneeId: string, taskTitle: string, newStatus: string, taskId: string): Promise<void> {
    await this.notify({
      userId: assigneeId,
      type: "task_updated",
      title: "Task Updated",
      message: `Task "${taskTitle}" status changed to ${newStatus}`,
      data: { taskId, newStatus },
    });
  }

  async notifyCommentAdded(userId: string, taskTitle: string, taskId: string, commenterName: string): Promise<void> {
    await this.notify({
      userId,
      type: "comment_added",
      title: "New Comment",
      message: `${commenterName} commented on: ${taskTitle}`,
      data: { taskId },
    });
  }

  async getUnread(userId: string) {
    await connectMongoDB();
    return Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await connectMongoDB();
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } }
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await connectMongoDB();
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
  }
}
