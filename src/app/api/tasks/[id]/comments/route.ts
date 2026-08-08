import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Comment from "@/models/Comment";
import Task from "@/models/Task";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { auditService, notificationService } from "@/lib/container";
import { z } from "zod";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  authorName: z.string().min(1).max(100),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    await connectMongoDB();

    const comments = await Comment.find({ taskId: new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(createApiResponse(true, comments));
  } catch {
    return NextResponse.json(createApiResponse(false, null, "Internal server error"), { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 30);
    if (!rateCheck.success) {
      return NextResponse.json(createApiResponse(false, null, rateCheck.error), { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content, authorName } = commentSchema.parse(body);

    await connectMongoDB();

    const task = await Task.findById(id).lean() as any;
    if (!task) {
      return NextResponse.json(createApiResponse(false, null, "Task not found"), { status: 404 });
    }

    const comment = await Comment.create({
      taskId: new mongoose.Types.ObjectId(id),
      authorId: userId,
      authorName,
      content,
    });

    await Promise.all([
      auditService.log({
        actor: userId,
        action: "COMMENT_ADDED",
        target: id,
        targetType: "task",
        metadata: { commentId: comment._id.toString() },
      }),
      task.assigneeId && task.assigneeId !== userId
        ? notificationService.notifyCommentAdded(task.assigneeId, task.title, id, authorName)
        : Promise.resolve(),
    ]);

    return NextResponse.json(createApiResponse(true, comment), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(createApiResponse(false, null, error.issues[0].message), { status: 400 });
    }
    return NextResponse.json(createApiResponse(false, null, "Internal server error"), { status: 500 });
  }
}
