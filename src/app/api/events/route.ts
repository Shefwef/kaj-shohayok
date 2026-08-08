import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { registerClient, unregisterClient } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      registerClient(userId, controller as unknown as ReadableStreamDefaultController);

      controller.enqueue(
        encoder.encode(`event: connected\ndata: {"userId":"${userId}"}\n\n`)
      );

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unregisterClient(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
