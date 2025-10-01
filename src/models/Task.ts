import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  projectId: mongoose.Types.ObjectId;
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: mongoose.Types.ObjectId[];
  tags: string[];
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assigneeId: {
      type: String,
    },
    reporterId: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
    },
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ reporterId: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
