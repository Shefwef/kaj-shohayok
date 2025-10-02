"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  Tag,
  MoreVertical,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  endDate?: string;
  progress: number;
  tags: string[];
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && typeof params.id === "string") {
      fetchProject();
      fetchTasks();
    } else {
      setError("Invalid project ID");
      setLoading(false);
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

      if (!projectId || typeof projectId !== "string") {
        setError("Invalid project ID format");
        return;
      }

      console.log("Fetching project with ID:", projectId);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        setError(
          `Failed to fetch project: ${response.status} ${response.statusText}`
        );
        return;
      }

      const result = await response.json();

      if (result.success) {
        setProject(result.data);
      } else {
        setError(result.error || "Failed to fetch project");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("An error occurred while fetching project details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

      if (!projectId || typeof projectId !== "string") {
        console.error("Invalid project ID for tasks fetch");
        setTasks([]);
        return;
      }

      console.log("Fetching tasks for project ID:", projectId);
      const response = await fetch(`/api/tasks?projectId=${projectId}`);

      if (!response.ok) {
        console.error(
          `Failed to fetch tasks: ${response.status} ${response.statusText}`
        );
        setTasks([]);
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Handle nested tasks data structure
        const tasksData = result.data.tasks || result.data || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        console.error("Tasks fetch unsuccessful:", result.error);
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-800 bg-red-100";
      case "high":
        return "text-orange-800 bg-orange-100";
      case "medium":
        return "text-yellow-800 bg-yellow-100";
      case "low":
        return "text-green-800 bg-green-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-800 bg-green-100";
      case "active":
        return "text-blue-800 bg-blue-100";
      case "on_hold":
        return "text-yellow-800 bg-yellow-100";
      case "planning":
        return "text-purple-800 bg-purple-100";
      case "cancelled":
        return "text-red-800 bg-red-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-800 bg-green-100";
      case "in_progress":
        return "text-blue-800 bg-blue-100";
      case "review":
        return "text-yellow-800 bg-yellow-100";
      case "todo":
        return "text-gray-800 bg-gray-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Project not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || "The project you're looking for doesn't exist."}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const completedTasks = tasksArray.filter(
    (task) => task.status === "done"
  ).length;
  const totalTasks = tasksArray.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="mb-6">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        {/* project overview */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {project.priority} priority
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  disabled
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
                  title="Edit functionality coming soon"
                >
                  Edit Project
                </button>
                <button className="inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {project.description && (
              <p className="mt-4 text-gray-600">{project.description}</p>
            )}

            {/* project meta info */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Start Date</p>
                  <p className="text-gray-600">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {project.endDate && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">End Date</p>
                    <p className="text-gray-600">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Team Members</p>
                  <p className="text-gray-600">
                    {project.teamMembers ? project.teamMembers.length : 0}{" "}
                    members
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Progress</p>
                  <p className="text-gray-600">
                    {Math.round(taskProgress)}% complete
                  </p>
                </div>
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">
                  Overall Progress
                </span>
                <span className="text-gray-600">
                  {completedTasks}/{totalTasks} tasks completed
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${taskProgress}%` }}
                ></div>
              </div>
            </div>

            {/* tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* tasks section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <Link
                href={`/dashboard/tasks/new?projectId=${project._id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            </div>
          </div>

          <div className="px-6 py-5">
            {tasksLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : tasksArray.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No tasks yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new task for this project.
                </p>
                <div className="mt-6">
                  <Link
                    href={`/dashboard/tasks/new?projectId=${project._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first task
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasksArray.map((task) => (
                  <div
                    key={task._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        #{task._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
