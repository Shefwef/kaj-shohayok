import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/services/AIService";
import { taskRepo } from "@/lib/container";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const schema = z.object({
  taskTitle: z.string().min(1).max(200),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assigneeId: z.string().min(1),
  projectId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 15);
    if (!rateCheck.success) {
      return NextResponse.json(createApiResponse(false, null, rateCheck.error), { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { taskTitle, priority, assigneeId } = schema.parse(body);

    const stats = await taskRepo.getCompletionStats(assigneeId);
    const prediction = await aiService.predictCompletion({
      taskTitle,
      priority,
      assigneeId,
      completedTasks: stats.completedTasks,
      avgDays: stats.avgDays,
      activeTasks: stats.activeTasks,
    });

    return NextResponse.json(
      createApiResponse(true, { ...prediction, assigneeStats: stats })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createApiResponse(false, null, error.issues[0].message),
        { status: 400 }
      );
    }
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
