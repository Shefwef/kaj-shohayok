import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/services/AIService";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const schema = z.object({
  taskTitle: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  projectContext: z.string().max(500).optional(),
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
    const validated = schema.parse(body);
    const suggestion = await aiService.getTaskAssistance(validated);

    return NextResponse.json(createApiResponse(true, suggestion));
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
