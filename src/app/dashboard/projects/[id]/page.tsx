"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  Tag,
  Plus,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/kanban/KanbanBoard";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  progress: number;
  tags: string[];
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  planning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const fetchData = useCallback(async () => {
    if (!projectId) { setError("Invalid project ID"); setLoading(false); return; }
    try {
      const [projRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}&limit=100`),
      ]);

      if (!projRes.ok) { setError(`Project not found (${projRes.status})`); return; }
      const projData = await projRes.json();
      if (projData.success) setProject(projData.data);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (tasksData.success) {
          setTasks(tasksData.data?.tasks ?? tasksData.data ?? []);
        }
      }
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTaskMove = async (taskId: string, newStatus: "todo" | "in_progress" | "review" | "done") => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update task");
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-900 dark:text-white font-medium">Project not found</p>
          <p className="text-gray-500 mt-1 text-sm">{error}</p>
          <Link
            href="/dashboard/projects"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        {/* Project header */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[project.status] ?? STATUS_BADGE.active}`}>
                  {project.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[project.priority] ?? PRIORITY_BADGE.medium}`}>
                  {project.priority} priority
                </span>
              </div>
            </div>
            <Link
              href={`/dashboard/tasks/new?projectId=${project._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Task
            </Link>
          </div>

          {project.description && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">{project.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.teamMembers?.length ?? 0} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {completedTasks}/{tasks.length} done
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Overall progress</span>
              <span>{Math.round(taskProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Task board */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks
            </h2>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView("kanban")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "kanban"
                    ? "bg-white dark:bg-gray-700 shadow text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
                title="Kanban view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "list"
                    ? "bg-white dark:bg-gray-700 shadow text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-900 dark:text-white font-medium">No tasks yet</p>
              <p className="text-gray-500 text-sm mt-1">Create the first task for this project</p>
              <Link
                href={`/dashboard/tasks/new?projectId=${project._id}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus className="h-4 w-4" /> Add first task
              </Link>
            </div>
          ) : view === "kanban" ? (
            <KanbanBoard
              tasks={tasks}
              projectId={project._id}
              onTaskMove={handleTaskMove}
            />
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[task.status] ?? STATUS_BADGE.active}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
