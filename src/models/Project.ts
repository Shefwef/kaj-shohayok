import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
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

const ProjectSchema: Schema = new Schema(
  {
    name: {
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
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    organizationId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    teamMembers: [
      {
        type: String,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ organizationId: 1, status: 1 });
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ teamMembers: 1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
