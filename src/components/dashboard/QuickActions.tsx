"use client";

import { Plus, FolderPlus, FileText, Users } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    name: "Create Project",
    description: "Start a new project",
    href: "/dashboard/projects/new",
    icon: FolderPlus,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Add Task",
    description: "Create a new task",
    href: "/dashboard/tasks/new",
    icon: Plus,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "View Reports",
    description: "Check analytics",
    href: "/dashboard/analytics",
    icon: FileText,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Team Management",
    description: "Manage team members",
    href: "/dashboard/team",
    icon: Users,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="relative group bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className={`inline-flex p-3 rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.iconColor}`} />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">
                {action.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
