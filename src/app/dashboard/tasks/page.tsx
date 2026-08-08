"use client";

import { useState, useEffect } from "react";
import {
  Search, Plus, Calendar, CircleCheckBig, Clock,
  AlertCircle, Edit, Save, X, Circle,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  projectId: string;
  projectName?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  high:     "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
  medium:   "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  low:      "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
};

const STATUS_CLASSES: Record<string, string> = {
  done:        "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20",
  in_progress: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  review:      "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  todo:        "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
};

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function StatusIcon({ status }: { status: string }) {
  if (status === "done")        return <CircleCheckBig className="h-4 w-4 text-emerald-500" />;
  if (status === "in_progress") return <Clock className="h-4 w-4 text-blue-500" />;
  if (status === "review")      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return <Circle className="h-4 w-4 text-gray-400" />;
}

const inputCls = "block w-full rounded-lg border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 transition-colors";
const selectCls = "block w-full rounded-lg border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Task>>({});

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    const arr = Array.isArray(tasks) ? tasks : [];
    let filtered = arr;
    if (searchQuery) filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (statusFilter !== "all")   filtered = filtered.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") filtered = filtered.filter((t) => t.priority === priorityFilter);
    filtered.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const r = await fetch("/api/tasks");
      const d = await r.json();
      if (d.success) setTasks(Array.isArray(d.data?.tasks ?? d.data) ? (d.data?.tasks ?? d.data) : []);
      else setTasks([]);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  const isOverdue = (dueDate: string) =>
    new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();

  const handleSave = async (taskId: string) => {
    try {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const d = await r.json();
      if (d.success) {
        setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, ...d.data } : t));
        setEditingTask(null);
      }
    } catch (e) { console.error(e); }
  };

  const taskArr = Array.isArray(tasks) ? tasks : [];
  const stats = [
    { label: "Total Tasks",  value: taskArr.length,                                              icon: <Circle className="h-5 w-5 text-gray-400" /> },
    { label: "Completed",    value: taskArr.filter((t) => t.status === "done").length,           icon: <CircleCheckBig className="h-5 w-5 text-emerald-500" /> },
    { label: "In Progress",  value: taskArr.filter((t) => t.status === "in_progress").length,    icon: <Clock className="h-5 w-5 text-blue-500" /> },
    { label: "Overdue",      value: taskArr.filter((t) => t.dueDate && isOverdue(t.dueDate) && t.status !== "done").length, icon: <AlertCircle className="h-5 w-5 text-red-500" /> },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage and track all your tasks across projects</p>
          </div>
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Task
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-gray-900 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="Search tasks…"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectCls}>
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        <div className="rounded-2xl border border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-emerald-900/20">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Tasks ({filteredTasks.length})</h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CircleCheckBig className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" />
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No tasks found</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {tasks.length === 0 ? "Get started by creating your first task." : "Try adjusting your filters."}
              </p>
              <Link href="/dashboard/tasks/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                <Plus className="h-4 w-4" /> New Task
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-emerald-900/10">
              {filteredTasks.map((task) => (
                <div key={task._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                  {editingTask === task._id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Title</label>
                          <input type="text" value={editFormData.title || ""} onChange={(e) => setEditFormData((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
                          <select value={editFormData.status || ""} onChange={(e) => setEditFormData((p) => ({ ...p, status: e.target.value as Task["status"] }))} className={selectCls}>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Priority</label>
                          <select value={editFormData.priority || ""} onChange={(e) => setEditFormData((p) => ({ ...p, priority: e.target.value as Task["priority"] }))} className={selectCls}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Due Date</label>
                          <input type="date" value={editFormData.dueDate ? new Date(editFormData.dueDate).toISOString().split("T")[0] : ""} onChange={(e) => setEditFormData((p) => ({ ...p, dueDate: e.target.value }))} className={inputCls} />
                        </div>
                      </div>
                      <textarea value={editFormData.description || ""} onChange={(e) => setEditFormData((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Description…" className={inputCls} />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(task._id)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
                          <Save className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={() => setEditingTask(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={task.status} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</span>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[task.status] ?? STATUS_CLASSES.todo}`}>
                            {task.status.replace("_", " ")}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[task.priority] ?? PRIORITY_CLASSES.low}`}>
                            {task.priority}
                          </span>
                          {task.projectName && (
                            <Link href={`/dashboard/projects/${task.projectId}`} className="text-xs text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                              {task.projectName}
                            </Link>
                          )}
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) && task.status !== "done" ? "text-red-500 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue(task.dueDate) && task.status !== "done" && " · Overdue"}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => { setEditingTask(task._id); setEditFormData({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate }); }}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
