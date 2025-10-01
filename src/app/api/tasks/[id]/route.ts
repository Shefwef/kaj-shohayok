import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { updateTaskSchema } from "@/lib/validations/task";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid task ID"),
        { status: 400 }
      );
    }

    await connectMongoDB();

    const task = await Task.findById(id)
      .populate("projectId", "name ownerId teamMembers")
      .populate("dependencies", "title status")
      .lean();

    if (!task) {
      return NextResponse.json(
        createApiResponse(false, null, "Task not found"),
        { status: 404 }
      );
    }

    // Check if user has access to this task
    const taskDoc = task as any;
    const hasAccess =
      taskDoc.assigneeId === userId ||
      taskDoc.reporterId === userId ||
      taskDoc.projectId?.ownerId === userId ||
      taskDoc.projectId?.teamMembers?.includes(userId);

    if (!hasAccess) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiResponse(true, task));
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 50);
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid task ID"),
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    await connectMongoDB();

    // Get the task with project info
    const existingTask = await Task.findById(id).populate(
      "projectId",
      "ownerId teamMembers"
    );

    if (!existingTask) {
      return NextResponse.json(
        createApiResponse(false, null, "Task not found"),
        { status: 404 }
      );
    }

    // Check if user has permission to update this task
    const taskDoc = existingTask as any;
    const canUpdate =
      taskDoc.assigneeId === userId ||
      taskDoc.reporterId === userId ||
      taskDoc.projectId?.ownerId === userId ||
      taskDoc.projectId?.teamMembers?.includes(userId);

    if (!canUpdate) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate)
      updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.dependencies) {
      updateData.dependencies = validatedData.dependencies.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate("projectId", "name")
      .populate("dependencies", "title status")
      .lean();

    return NextResponse.json(createApiResponse(true, task));
  } catch (error) {
    console.error("Error updating task:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 20);
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid task ID"),
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Get the task with project info
    const task = await Task.findById(id).populate(
      "projectId",
      "ownerId teamMembers"
    );

    if (!task) {
      return NextResponse.json(
        createApiResponse(false, null, "Task not found"),
        { status: 404 }
      );
    }

    // Check if user has permission to delete this task
    const taskDoc = task as any;
    const canDelete =
      taskDoc.reporterId === userId || taskDoc.projectId?.ownerId === userId;

    if (!canDelete) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    await Task.findByIdAndDelete(id);

    return NextResponse.json(
      createApiResponse(true, { message: "Task deleted successfully" })
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
