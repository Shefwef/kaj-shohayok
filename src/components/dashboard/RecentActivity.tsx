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
  projectId?: {
    _id: string;
    name: string;
  } | null;
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
    const fetchRecentData = async () => {
      try {
        const response = await fetch("/api/analytics");
        const result = await response.json();
        if (result.success) {
          setRecentData(result.data.recent);
        }
      } catch (error) {
        console.error("Error fetching recent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={`loading-card-${i}`}
            className="animate-pulse bg-white rounded-lg shadow p-6"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div
                  key={`loading-item-${i}-${j}`}
                  className="h-16 bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!recentData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No recent activity found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* recent projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
        </div>
        <div className="p-6">
          {recentData.projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent projects</p>
          ) : (
            <div className="space-y-4">
              {recentData.projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {formatDateTime(project.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* recent tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
        </div>
        <div className="p-6">
          {recentData.tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent tasks</p>
          ) : (
            <div className="space-y-4">
              {recentData.tasks.map((task) => (
                <Link
                  key={task._id}
                  href={`/dashboard/tasks/${task._id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        in {task.projectId?.name || "No Project"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created {formatDateTime(task.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
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
    </div>
  );
}
