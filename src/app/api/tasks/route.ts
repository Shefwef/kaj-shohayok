import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { createTaskSchema } from "@/lib/validations/task";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), {
        status: 401,
      });
    }

    await connectMongoDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const assigneeId = url.searchParams.get("assigneeId");
    const projectId = url.searchParams.get("projectId");
    const search = url.searchParams.get("search");

    // First, get projects the user has access to
    const userProjects = await Project.find({
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    })
      .select("_id")
      .lean();

    const projectIds = userProjects.map((p) => p._id);

    // Build query for tasks
    const query: any = {
      $or: [
        { assigneeId: userId },
        { reporterId: userId },
        { projectId: { $in: projectIds } },
      ],
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId) query.assigneeId = assigneeId;
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.projectId = new mongoose.Types.ObjectId(projectId);
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Task.countDocuments(query);

    return NextResponse.json(
      createApiResponse(true, {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 30);
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), {
        status: 401,
      });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    await connectMongoDB();

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: validatedData.projectId,
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    });

    if (!project) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Project not found or insufficient permissions"
        ),
        { status: 404 }
      );
    }

    const taskData: any = {
      ...validatedData,
      reporterId: userId,
      projectId: new mongoose.Types.ObjectId(validatedData.projectId),
    };

    if (validatedData.dueDate) {
      taskData.dueDate = new Date(validatedData.dueDate);
    }

    if (validatedData.dependencies) {
      taskData.dependencies = validatedData.dependencies.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "name")
      .lean();

    return NextResponse.json(createApiResponse(true, populatedTask), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof Error) {
      return NextResponse.json(createApiResponse(false, null, error.message), {
        status: 400,
      });
    }
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
