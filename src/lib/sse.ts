// In-memory SSE client registry (per-process, resets on cold start).
// For production scale, replace with Redis pub/sub via Upstash.
const clients = new Map<string, ReadableStreamDefaultController>();

export function registerClient(userId: string, controller: ReadableStreamDefaultController) {
  clients.set(userId, controller);
}

export function unregisterClient(userId: string) {
  clients.delete(userId);
}

export function notifyUser(userId: string, event: string, data: unknown) {
  const controller = clients.get(userId);
  if (controller) {
    try {
      controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      clients.delete(userId);
    }
  }
}
