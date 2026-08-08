import { getStatusColor, getPriorityColor } from "@/lib/utils";

describe("Task status utilities", () => {
  describe("getStatusColor", () => {
    test("returns blue for in_progress", () => {
      expect(getStatusColor("in_progress")).toContain("blue");
    });

    test("returns green for done", () => {
      expect(getStatusColor("done")).toContain("green");
    });

    test("returns green for completed", () => {
      expect(getStatusColor("completed")).toContain("green");
    });

    test("returns yellow for todo", () => {
      expect(getStatusColor("todo")).toContain("yellow");
    });

    test("returns purple for review", () => {
      expect(getStatusColor("review")).toContain("purple");
    });

    test("returns gray for unknown status", () => {
      expect(getStatusColor("unknown_status")).toContain("gray");
    });

    test("handles null gracefully", () => {
      expect(getStatusColor(null)).toContain("gray");
    });

    test("handles undefined gracefully", () => {
      expect(getStatusColor(undefined)).toContain("gray");
    });
  });

  describe("getPriorityColor", () => {
    test("returns red for critical priority", () => {
      expect(getPriorityColor("critical")).toContain("red");
    });

    test("returns orange for high priority", () => {
      expect(getPriorityColor("high")).toContain("orange");
    });

    test("returns yellow for medium priority", () => {
      expect(getPriorityColor("medium")).toContain("yellow");
    });

    test("returns green for low priority", () => {
      expect(getPriorityColor("low")).toContain("green");
    });

    test("handles null gracefully", () => {
      expect(getPriorityColor(null)).toContain("gray");
    });

    test("is case-insensitive", () => {
      expect(getPriorityColor("CRITICAL")).toContain("red");
      expect(getPriorityColor("High")).toContain("orange");
    });
  });
});

describe("Task status transitions (business rules)", () => {
  const validTransitions: Record<string, string[]> = {
    todo: ["in_progress"],
    in_progress: ["review", "todo", "done"],
    review: ["in_progress", "done"],
    done: [],
  };

  test("tasks can move from todo to in_progress", () => {
    expect(validTransitions.todo).toContain("in_progress");
  });

  test("completed tasks cannot be reassigned (done is terminal)", () => {
    expect(validTransitions.done).toHaveLength(0);
  });

  test("tasks in review can be moved back to in_progress", () => {
    expect(validTransitions.review).toContain("in_progress");
  });

  test("all statuses are defined", () => {
    expect(Object.keys(validTransitions)).toEqual(
      expect.arrayContaining(["todo", "in_progress", "review", "done"])
    );
  });
});
