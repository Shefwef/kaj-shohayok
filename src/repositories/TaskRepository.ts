import connectMongoDB from "@/lib/db/mongodb";
import Task from "@/models/Task";
import mongoose from "mongoose";
import { Task as TaskType, CreateTaskData, UpdateTaskData, TaskFilters } from "@/lib/types";

export class TaskRepository {
  async findById(id: string): Promise<TaskType | null> {
    await connectMongoDB();
    const task = await Task.findById(id).populate("projectId", "name").lean();
    return task as unknown as TaskType | null;
  }

  async findByProject(projectId: string, filters: TaskFilters = {}): Promise<TaskType[]> {
    await connectMongoDB();
    const query: Record<string, unknown> = {
      projectId: new mongoose.Types.ObjectId(projectId),
    };
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assigneeId) query.assigneeId = filters.assigneeId;
    if (filters.search) query.title = { $regex: filters.search, $options: "i" };
    if (filters.overdue) {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "done" };
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .lean();
    return tasks as unknown as TaskType[];
  }

  async findByUser(userId: string, filters: TaskFilters = {}): Promise<TaskType[]> {
    await connectMongoDB();
    const query: Record<string, unknown> = {
      $or: [{ assigneeId: userId }, { reporterId: userId }],
    };
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.projectId) {
      query.projectId = new mongoose.Types.ObjectId(filters.projectId);
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .lean();
    return tasks as unknown as TaskType[];
  }

  async findOverdue(projectIds: string[]): Promise<TaskType[]> {
    await connectMongoDB();
    const tasks = await Task.find({
      projectId: { $in: projectIds.map((id) => new mongoose.Types.ObjectId(id)) },
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    })
      .populate("projectId", "name")
      .lean();
    return tasks as unknown as TaskType[];
  }

  async create(data: CreateTaskData & { reporterId: string }): Promise<TaskType> {
    await connectMongoDB();
    const taskData: Record<string, unknown> = {
      ...data,
      projectId: new mongoose.Types.ObjectId(data.projectId),
    };
    if (data.dueDate) taskData.dueDate = new Date(data.dueDate);
    if (data.dependencies) {
      taskData.dependencies = data.dependencies.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    const task = await Task.create(taskData);
    const populated = await Task.findById(task._id)
      .populate("projectId", "name")
      .lean();
    return populated as unknown as TaskType;
  }

  async update(id: string, data: UpdateTaskData): Promise<TaskType | null> {
    await connectMongoDB();
    const updated = await Task.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("projectId", "name")
      .lean();
    return updated as unknown as TaskType | null;
  }

  async delete(id: string): Promise<void> {
    await connectMongoDB();
    await Task.findByIdAndDelete(id);
  }

  async count(query: Record<string, unknown> = {}): Promise<number> {
    await connectMongoDB();
    return Task.countDocuments(query);
  }

  async getAssigneeStats(projectIds: string[]): Promise<Array<{ assigneeId: string; count: number; completed: number }>> {
    await connectMongoDB();
    const result = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIds.map((id) => new mongoose.Types.ObjectId(id)) },
          assigneeId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$assigneeId",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
          },
        },
      },
    ]);
    return result.map((r) => ({
      assigneeId: r._id,
      count: r.count,
      completed: r.completed,
    }));
  }

  async getCompletionStats(assigneeId: string, days = 30): Promise<{ completedTasks: number; avgDays: number; activeTasks: number }> {
    await connectMongoDB();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [completed, active] = await Promise.all([
      Task.find({
        assigneeId,
        status: "done",
        updatedAt: { $gte: since },
      }).lean(),
      Task.countDocuments({ assigneeId, status: { $in: ["todo", "in_progress", "review"] } }),
    ]);

    const avgDays =
      completed.length > 0
        ? completed.reduce((sum, t: any) => {
            const created = new Date(t.createdAt).getTime();
            const updated = new Date(t.updatedAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / completed.length
        : 3;

    return {
      completedTasks: completed.length,
      avgDays: Math.round(avgDays * 10) / 10,
      activeTasks: active,
    };
  }
}
