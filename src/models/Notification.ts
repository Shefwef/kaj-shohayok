import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "task_assigned",
        "task_updated",
        "task_completed",
        "project_updated",
        "project_created",
        "deadline_approaching",
        "mention",
        "comment_added",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Add indexes for better query performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
