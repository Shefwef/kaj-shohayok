import { prisma } from "@/lib/db/postgres";
import { Permission, RoleName } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  admin: [
    "create:project",
    "read:project",
    "update:project",
    "delete:project",
    "create:task",
    "read:task",
    "update:task",
    "delete:task",
    "assign:task",
    "view:analytics",
    "manage:users",
    "manage:roles",
  ],
  manager: [
    "create:project",
    "read:project",
    "update:project",
    "create:task",
    "read:task",
    "update:task",
    "assign:task",
    "view:analytics",
    "manage:users",
  ],
  member: [
    "read:project",
    "create:task",
    "read:task",
    "update:task",
    "view:analytics",
  ],
  viewer: ["read:project", "read:task", "view:analytics"],
};

export async function getUserPermissions(userId: string): Promise<{
  role: string | null;
  permissions: Permission[];
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        role: {
          select: {
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.role) {
      return { role: null, permissions: [] };
    }

    return {
      role: user.role.name,
      permissions: user.role.permissions as Permission[],
    };
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return { role: null, permissions: [] };
  }
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const { permissions } = await getUserPermissions(userId);
    return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

export async function hasRole(roleName: RoleName): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const { role } = await getUserPermissions(userId);
    return role === roleName;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

export async function canAccessResource(
  resourceType: "project" | "task",
  resourceId: string,
  action: "read" | "write" | "delete" = "read"
): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    // checking admin permission first
    const isAdmin = await hasRole("admin");
    if (isAdmin) return true;

    // checking specific permissions based on action
    const permission = `${
      action === "read" ? "read" : action === "delete" ? "delete" : "update"
    }:${resourceType}` as Permission;
    const hasRequiredPermission = await hasPermission(permission);

    if (!hasRequiredPermission) return false;

    // for project resources, checking ownership or team membership via MongoDB
    if (resourceType === "project") {
      try {
        const connectMongoDB = (await import("@/lib/db/mongodb")).default;
        const Project = (await import("@/models/Project")).default;

        await connectMongoDB();

        const project = await Project.findOne({
          _id: resourceId,
          $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
        }).lean();

        return !!project;
      } catch (error) {
        console.error("Error checking project access:", error);
        return false;
      }
    }

    // for task resources, checking via project ownership/membership
    if (resourceType === "task") {
      try {
        const connectMongoDB = (await import("@/lib/db/mongodb")).default;
        const Task = (await import("@/models/Task")).default;
        const Project = (await import("@/models/Project")).default;

        await connectMongoDB();

        const task = (await Task.findById(resourceId).lean()) as any;
        if (!task) return false;

        const project = await Project.findOne({
          _id: task.projectId,
          $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
        }).lean();

        return !!project;
      } catch (error) {
        console.error("Error checking task access:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking resource access:", error);
    return false;
  }
}

export function requirePermission(permission: Permission) {
  return async () => {
    const hasRequiredPermission = await hasPermission(permission);
    if (!hasRequiredPermission) {
      throw new Error("Insufficient permissions");
    }
    return true;
  };
}

export function requireRole(roleName: RoleName) {
  return async () => {
    const hasRequiredRole = await hasRole(roleName);
    if (!hasRequiredRole) {
      throw new Error("Insufficient role privileges");
    }
    return true;
  };
}

export function getDefaultRole(): RoleName {
  return "member";
}

export async function isOrganizationAdmin(
  organizationId?: string
): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) return false;

    // checking if user has admin role
    if (user.role?.name === "admin") return true;

    // checking if user is in the specified organization
    if (organizationId && user.organizationId !== organizationId) {
      return false;
    }

    return false;
  } catch (error) {
    console.error("Error checking organization admin status:", error);
    return false;
  }
}
