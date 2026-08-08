import { createProjectSchema } from "@/lib/validations/project";
import { createTaskSchema } from "@/lib/validations/task";
import { NotFoundError, UnauthorizedError, BusinessError, ValidationError } from "@/lib/errors";
import { EventBus } from "@/lib/EventBus";

describe("Project validation schema", () => {
  const validProject = {
    name: "Test Project",
    description: "A test project description",
    priority: "medium" as const,
    teamMembers: [],
    startDate: new Date().toISOString(),
    tags: [],
  };

  test("accepts valid project data", () => {
    expect(() => createProjectSchema.parse(validProject)).not.toThrow();
  });

  test("rejects empty project name", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, name: "" })
    ).toThrow();
  });

  test("rejects invalid priority", () => {
    expect(() =>
      createProjectSchema.parse({ ...validProject, priority: "invalid" })
    ).toThrow();
  });

  test("accepts all valid priority values", () => {
    ["low", "medium", "high", "critical"].forEach((priority) => {
      expect(() =>
        createProjectSchema.parse({ ...validProject, priority })
      ).not.toThrow();
    });
  });
});

describe("Task validation schema", () => {
  const validTask = {
    title: "Test Task",
    priority: "medium" as const,
    projectId: "507f1f77bcf86cd799439011",
  };

  test("accepts valid task data", () => {
    expect(() => createTaskSchema.parse(validTask)).not.toThrow();
  });

  test("rejects empty task title", () => {
    expect(() =>
      createTaskSchema.parse({ ...validTask, title: "" })
    ).toThrow();
  });

  test("rejects invalid priority", () => {
    expect(() =>
      createTaskSchema.parse({ ...validTask, priority: "extreme" })
    ).toThrow();
  });

  test("accepts optional description", () => {
    expect(() =>
      createTaskSchema.parse({ ...validTask, description: "A detailed description" })
    ).not.toThrow();
  });

  test("accepts all valid priority values", () => {
    ["low", "medium", "high", "critical"].forEach((priority) => {
      expect(() =>
        createTaskSchema.parse({ ...validTask, priority })
      ).not.toThrow();
    });
  });
});

describe("Error classes", () => {

  test("NotFoundError has status 404", () => {
    const err = new NotFoundError("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
  });

  test("UnauthorizedError has status 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  test("BusinessError has status 422", () => {
    const err = new BusinessError("Business rule violated");
    expect(err.statusCode).toBe(422);
  });

  test("ValidationError has status 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.statusCode).toBe(400);
  });
});

describe("EventBus", () => {

  beforeEach(() => {
    EventBus.clear();
  });

  test("subscribes and receives events", async () => {
    const received: unknown[] = [];
    EventBus.subscribe("test:event", (data: unknown) => {
      received.push(data);
    });
    await EventBus.publish("test:event", { id: 1 });
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ id: 1 });
  });

  test("multiple subscribers all receive the event", async () => {
    const count = { value: 0 };
    EventBus.subscribe("multi:event", () => { count.value += 1; });
    EventBus.subscribe("multi:event", () => { count.value += 1; });
    await EventBus.publish("multi:event", {});
    expect(count.value).toBe(2);
  });

  test("unsubscribe stops receiving events", async () => {
    const received: unknown[] = [];
    const handler = (data: unknown) => received.push(data);
    EventBus.subscribe("unsub:event", handler);
    EventBus.unsubscribe("unsub:event", handler);
    await EventBus.publish("unsub:event", {});
    expect(received).toHaveLength(0);
  });

  test("publish to unregistered event does not throw", async () => {
    await expect(EventBus.publish("no:subscribers", {})).resolves.toBeUndefined();
  });
});
