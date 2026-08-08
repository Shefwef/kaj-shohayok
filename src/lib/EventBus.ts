type EventHandler<T> = (payload: T) => void | Promise<void>;

export class EventBus {
  private static handlers: Map<string, EventHandler<unknown>[]> = new Map();

  static subscribe<T>(event: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...existing, handler as EventHandler<unknown>]);
  }

  static unsubscribe<T>(event: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(
      event,
      existing.filter((h) => h !== (handler as EventHandler<unknown>))
    );
  }

  static async publish<T>(event: string, payload: T): Promise<void> {
    const handlers = this.handlers.get(event) ?? [];
    await Promise.all(handlers.map((h) => h(payload)));
  }

  static clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}
