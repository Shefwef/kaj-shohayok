import { ROLE_PERMISSIONS } from "@/lib/permissions";
import type { Permission, RoleName } from "@/lib/types";

describe("RBAC Permission Matrix", () => {
  const allPermissions: Permission[] = [
    "create:project", "read:project", "update:project", "delete:project",
    "create:task", "read:task", "update:task", "delete:task",
    "assign:task", "view:analytics", "manage:users", "manage:roles",
  ];

  test("admin has all permissions", () => {
    const adminPerms = ROLE_PERMISSIONS.admin;
    allPermissions.forEach((perm) => {
      expect(adminPerms).toContain(perm);
    });
  });

  test("viewer only has read permissions", () => {
    const viewerPerms = ROLE_PERMISSIONS.viewer;
    expect(viewerPerms).toContain("read:project");
    expect(viewerPerms).toContain("read:task");
    expect(viewerPerms).not.toContain("create:project");
    expect(viewerPerms).not.toContain("delete:project");
    expect(viewerPerms).not.toContain("delete:task");
    expect(viewerPerms).not.toContain("manage:users");
    expect(viewerPerms).not.toContain("manage:roles");
  });

  test("manager cannot delete projects", () => {
    expect(ROLE_PERMISSIONS.manager).not.toContain("delete:project");
  });

  test("manager cannot manage roles", () => {
    expect(ROLE_PERMISSIONS.manager).not.toContain("manage:roles");
  });

  test("member cannot delete tasks", () => {
    expect(ROLE_PERMISSIONS.member).not.toContain("delete:task");
  });

  test("member cannot assign tasks", () => {
    expect(ROLE_PERMISSIONS.member).not.toContain("assign:task");
  });

  test("member cannot manage users", () => {
    expect(ROLE_PERMISSIONS.member).not.toContain("manage:users");
  });

  test("all roles have read:project permission", () => {
    (["admin", "manager", "member", "viewer"] as RoleName[]).forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toContain("read:project");
    });
  });

  test("all roles have view:analytics permission", () => {
    (["admin", "manager", "member", "viewer"] as RoleName[]).forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toContain("view:analytics");
    });
  });

  test("permission hierarchy is respected (admin > manager > member > viewer)", () => {
    const adminCount = ROLE_PERMISSIONS.admin.length;
    const managerCount = ROLE_PERMISSIONS.manager.length;
    const memberCount = ROLE_PERMISSIONS.member.length;
    const viewerCount = ROLE_PERMISSIONS.viewer.length;

    expect(adminCount).toBeGreaterThan(managerCount);
    expect(managerCount).toBeGreaterThan(memberCount);
    expect(memberCount).toBeGreaterThan(viewerCount);
  });
});
