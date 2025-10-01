import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "Name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Name too long"),
  roleId: z.string().optional(),
  organizationId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  permissions: z.array(z.string()),
  organizationId: z.string().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  settings: z.record(z.string(), z.any()).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .omit({ slug: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
