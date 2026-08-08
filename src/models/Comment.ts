import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

CommentSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
