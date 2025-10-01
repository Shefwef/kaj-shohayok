import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  teamMembers: z.array(z.string()).default([]),
  startDate: z.string().refine((date) => new Date(date) instanceof Date, {
    message: "Invalid start date",
  }),
  endDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return new Date(date) instanceof Date;
      },
      {
        message: "Invalid end date",
      }
    ),
  tags: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(["active", "completed", "archived"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
