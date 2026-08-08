"use client";

import { FolderPlus, CirclePlus, BarChart2, Users } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    name: "New Project",
    description: "Start a new project",
    href: "/dashboard/projects/new",
    icon: FolderPlus,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800/50",
  },
  {
    name: "Add Task",
    description: "Create a new task",
    href: "/dashboard/tasks/new",
    icon: CirclePlus,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800/50",
  },
  {
    name: "Analytics",
    description: "View your insights",
    href: "/dashboard/analytics",
    icon: BarChart2,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800/50",
  },
  {
    name: "Team",
    description: "Manage your team",
    href: "/dashboard/team",
    icon: Users,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800/50",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`group flex flex-col gap-3 rounded-xl border border-gray-100 dark:border-emerald-900/20 bg-gray-50 dark:bg-gray-950 p-4 transition-all duration-200 hover:shadow-md ${action.hoverBorder} hover:bg-white dark:hover:bg-gray-900`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg} ring-1 ring-emerald-100 dark:ring-emerald-900/30`}>
              <action.icon className={`h-5 w-5 ${action.iconColor}`} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {action.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
