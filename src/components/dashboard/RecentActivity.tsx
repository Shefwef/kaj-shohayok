"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime, getPriorityColor, getStatusColor } from "@/lib/utils";

interface Project {
  _id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  projectId?: { _id: string; name: string } | null;
  createdAt: string;
}

interface RecentData {
  projects: Project[];
  tasks: Task[];
}

export default function RecentActivity() {
  const [recentData, setRecentData] = useState<RecentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRecentData(d.data.recent); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm h-64" />
        ))}
      </div>
    );
  }

  if (!recentData) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity found</p>
      </div>
    );
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h3>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Projects */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm">
        <SectionHeader title="Recent Projects" />
        {recentData.projects.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No projects yet</p>
        ) : (
          <div className="space-y-3">
            {recentData.projects.map((project) => (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className="block rounded-xl border border-gray-100 dark:border-emerald-900/20 p-4 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{formatDateTime(project.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-400 dark:text-gray-500">Progress</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm">
        <SectionHeader title="Recent Tasks" />
        {recentData.tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {recentData.tasks.map((task) => (
              <Link
                key={task._id}
                href={`/dashboard/tasks/${task._id}`}
                className="block rounded-xl border border-gray-100 dark:border-emerald-900/20 p-4 hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {task.projectId?.name ?? "No Project"} · {formatDateTime(task.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
