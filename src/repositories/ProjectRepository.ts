import connectMongoDB from "@/lib/db/mongodb";
import Project from "@/models/Project";
import { Project as ProjectType, CreateProjectData, UpdateProjectData, ProjectFilters } from "@/lib/types";

export class ProjectRepository {
  async findById(id: string): Promise<ProjectType | null> {
    await connectMongoDB();
    const project = await Project.findById(id).lean();
    return project as unknown as ProjectType | null;
  }

  async findByUser(userId: string, filters: ProjectFilters = {}): Promise<ProjectType[]> {
    await connectMongoDB();
    const query: Record<string, unknown> = {
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    };
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.search) {
      query.$and = [
        { $or: query.$or },
        {
          $or: [
            { name: { $regex: filters.search, $options: "i" } },
            { description: { $regex: filters.search, $options: "i" } },
          ],
        },
      ];
      delete query.$or;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();
    return projects as unknown as ProjectType[];
  }

  async create(data: CreateProjectData & { ownerId: string; organizationId: string }): Promise<ProjectType> {
    await connectMongoDB();
    const project = await Project.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    return project.toObject() as unknown as ProjectType;
  }

  async update(id: string, data: UpdateProjectData): Promise<ProjectType | null> {
    await connectMongoDB();
    const updated = await Project.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return updated as unknown as ProjectType | null;
  }

  async delete(id: string): Promise<void> {
    await connectMongoDB();
    await Project.findByIdAndDelete(id);
  }

  async findAccessibleIds(userId: string): Promise<string[]> {
    await connectMongoDB();
    const projects = await Project.find({
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    })
      .select("_id")
      .lean();
    return projects.map((p: any) => p._id.toString());
  }

  async count(userId: string): Promise<number> {
    await connectMongoDB();
    return Project.countDocuments({
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    });
  }
}
