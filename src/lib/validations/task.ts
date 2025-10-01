import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return new Date(date) instanceof Date;
      },
      {
        message: "Invalid due date",
      }
    ),
  estimatedHours: z.number().min(0).optional(),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  actualHours: z.number().min(0).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
