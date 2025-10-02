"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Shield,
  Building,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: { name: string; permissions: string[] };
  organization?: { name: string; slug: string };
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  organization?: { name: string; slug: string };
  _count: { users: number };
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
  _count: { users: number; roles: number };
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
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
];

export default function AdminDashboard() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  // dialog states
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // form states
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    organizationId: "",
  });

  const [orgForm, setOrgForm] = useState({
    name: "",
    slug: "",
    settings: {} as Record<string, unknown>,
  });

  // notification function
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // fetch data
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: { users: [...] } }
        setUsers(result.data?.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const result = await response.json();
        setRoles(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const result = await response.json();
        setOrganizations(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  // Check admin permissions
  const checkAdminAccess = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const result = await response.json();
        const userRole = result.data?.role?.name;
        const hasAdminAccess = userRole === "admin";

        setIsAdmin(hasAdminAccess);

        if (!hasAdminAccess) {
          // Redirect non-admin users
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      } else {
        setIsAdmin(false);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAdmin(false);
      router.push("/dashboard");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      checkAdminAccess();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    if (isAdmin === true) {
      fetchUsers();
      fetchRoles();
      fetchOrganizations();
    }
  }, [isAdmin]);

  // role management functions
  const handleCreateRole = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        showNotification("Role created successfully");
        setIsRoleDialogOpen(false);
        resetRoleForm();
        fetchRoles();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to create role", "error");
      }
    } catch {
      showNotification("Error creating role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        showNotification("Role updated successfully");
        setIsRoleDialogOpen(false);
        setEditingRole(null);
        resetRoleForm();
        fetchRoles();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to update role", "error");
      }
    } catch {
      showNotification("Error updating role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("Role deleted successfully");
        fetchRoles();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to delete role", "error");
      }
    } catch {
      showNotification("Error deleting role", "error");
    }
  };

  // organization management functions
  const handleCreateOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      });

      if (response.ok) {
        showNotification("Organization created successfully");
        setIsOrgDialogOpen(false);
        resetOrgForm();
        fetchOrganizations();
      } else {
        const error = await response.json();
        showNotification(
          error.error || "Failed to create organization",
          "error"
        );
      }
    } catch {
      showNotification("Error creating organization", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrg) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${editingOrg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      });

      if (response.ok) {
        showNotification("Organization updated successfully");
        setIsOrgDialogOpen(false);
        setEditingOrg(null);
        resetOrgForm();
        fetchOrganizations();
      } else {
        const error = await response.json();
        showNotification(
          error.error || "Failed to update organization",
          "error"
        );
      }
    } catch {
      showNotification("Error updating organization", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: "",
      description: "",
      permissions: [],
      organizationId: "",
    });
  };

  const resetOrgForm = () => {
    setOrgForm({
      name: "",
      slug: "",
      settings: {} as Record<string, unknown>,
    });
  };

  const openRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions,
        organizationId: role.organization?.name || "",
      });
    } else {
      setEditingRole(null);
      resetRoleForm();
    }
    setIsRoleDialogOpen(true);
  };

  const openOrgDialog = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setOrgForm({
        name: org.name,
        slug: org.slug,
        settings: org.settings || {},
      });
    } else {
      setEditingOrg(null);
      resetOrgForm();
    }
    setIsOrgDialogOpen(true);
  };

  // filter data based on search
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state while checking permissions
  if (!isLoaded || checking) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show access denied for non-admin users
  if (isAdmin === false) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have admin privileges to access this page. Only users
              with admin role can access the admin dashboard.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting you back to the dashboard in 3 seconds...
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage users, roles, and organizations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-8 w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({users.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roles"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles ({roles.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "organizations"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organizations ({organizations.length})
              </div>
            </button>
          </nav>
        </div>

        {/* users tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No users match your search criteria.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.role && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {user.role.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.organization && (
                        <p className="text-xs text-gray-400">
                          Organization: {user.organization.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* roles tab */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openRoleDialog()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Create Role
              </button>
            </div>

            {filteredRoles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No roles found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new role.
                </p>
              </div>
            ) : (
              filteredRoles.map((role) => (
                <div key={role.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {role.name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {role._count.users} users
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {role.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openRoleDialog(role)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 text-red-400 hover:text-red-600 border border-gray-200 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* organizations tab */}
        {activeTab === "organizations" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openOrgDialog()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Create Organization
              </button>
            </div>

            {filteredOrganizations.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No organizations found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new organization.
                </p>
              </div>
            ) : (
              filteredOrganizations.map((org) => (
                <div key={org.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {org.slug}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{org._count.users} users</span>
                        <span>{org._count.roles} roles</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrgDialog(org)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* role dialog */}
        {isRoleDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRoleForm({ ...roleForm, name: e.target.value })
                      }
                      placeholder="e.g. Project Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={roleForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRoleForm({
                          ...roleForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Role description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={roleForm.permissions.includes(permission)}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              if (e.target.checked) {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: [
                                    ...roleForm.permissions,
                                    permission,
                                  ],
                                });
                              } else {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: roleForm.permissions.filter(
                                    (p) => p !== permission
                                  ),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setIsRoleDialogOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        editingRole ? handleUpdateRole : handleCreateRole
                      }
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingRole
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* organization dialog */}
        {isOrgDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingOrg ? "Edit Organization" : "Create New Organization"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOrgForm({ ...orgForm, name: e.target.value })
                      }
                      placeholder="e.g. Acme Corporation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={orgForm.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOrgForm({ ...orgForm, slug: e.target.value })
                      }
                      placeholder="e.g. acme-corp"
                      disabled={!!editingOrg}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setIsOrgDialogOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        editingOrg
                          ? handleUpdateOrganization
                          : handleCreateOrganization
                      }
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : editingOrg ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
