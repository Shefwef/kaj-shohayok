import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { notificationService } from "@/lib/container";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(createApiResponse(false, null, rateCheck.error), { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const notifications = await notificationService.getUnread(userId);
    return NextResponse.json(createApiResponse(true, notifications));
  } catch {
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (body.markAllRead) {
      await notificationService.markAllRead(userId);
    } else if (body.notificationId) {
      await notificationService.markRead(userId, body.notificationId);
    }

    return NextResponse.json(createApiResponse(true, { success: true }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
