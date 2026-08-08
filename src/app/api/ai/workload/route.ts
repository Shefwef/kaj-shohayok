import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/services/AIService";
import { projectRepo, taskRepo } from "@/lib/container";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 10);
    if (!rateCheck.success) {
      return NextResponse.json(createApiResponse(false, null, rateCheck.error), { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const projectIds = await projectRepo.findAccessibleIds(userId);
    if (projectIds.length === 0) {
      return NextResponse.json(
        createApiResponse(true, { alerts: [], summary: "No projects found." })
      );
    }

    const assigneeStats = await taskRepo.getAssigneeStats(projectIds);
    const analysis = await aiService.analyzeWorkload(assigneeStats);

    return NextResponse.json(createApiResponse(true, analysis));
  } catch (error) {
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
