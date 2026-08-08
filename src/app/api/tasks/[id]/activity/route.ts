import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createApiResponse } from "@/lib/utils";
import { auditService } from "@/lib/container";

export const dynamic = 'force-dynamic';

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
    const history = await auditService.getTaskHistory(id);
    return NextResponse.json(createApiResponse(true, history));
  } catch {
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
