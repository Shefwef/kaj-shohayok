import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/services/AIService";
import { projectRepo, taskRepo } from "@/lib/container";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const schema = z.object({
  query: z.string().min(2).max(300),
});

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 10);
    if (!rateCheck.success) {
      return NextResponse.json(createApiResponse(false, null, rateCheck.error), { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { query } = schema.parse(body);

    const projectIds = await projectRepo.findAccessibleIds(userId);
    const allTasks: Array<{ _id: string; title: string; description?: string; status: string }> = [];

    for (const projectId of projectIds.slice(0, 10)) {
      const tasks = await taskRepo.findByProject(projectId);
      allTasks.push(
        ...tasks.map((t) => ({
          _id: t._id,
          title: t.title,
          description: t.description,
          status: t.status,
        }))
      );
    }

    const matchedIds = await aiService.semanticSearch(query, allTasks);
    const results = allTasks.filter((t) => matchedIds.includes(t._id));

    return NextResponse.json(createApiResponse(true, { results, total: results.length }));
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
