"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    teamMembers: number;
  };
  projectsByStatus: {
    planning: number;
    active: number;
    "on-hold": number;
    completed: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  tasksByStatus: {
    todo: number;
    "in-progress": number;
    review: number;
    completed: number;
  };
  monthlyProgress: {
    month: string;
    projectsCompleted: number;
    tasksCompleted: number;
  }[];
  topPerformers: {
    userId: string;
    userName: string;
    tasksCompleted: number;
    completionRate: number;
  }[];
  recentActivity: {
    type: string;
    title: string;
    project: string;
    user: string;
    timestamp: string;
  }[];
}

// default/fallback analytics data structure
const getDefaultAnalyticsData = (): AnalyticsData => ({
  overview: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    teamMembers: 0,
  },
  projectsByStatus: {
    planning: 0,
    active: 0,
    "on-hold": 0,
    completed: 0,
  },
  tasksByPriority: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  tasksByStatus: {
    todo: 0,
    "in-progress": 0,
    review: 0,
    completed: 0,
  },
  monthlyProgress: [],
  topPerformers: [],
  recentActivity: [],
});

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(() =>
    getDefaultAnalyticsData()
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?days=${timeRange}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && typeof result.data === "object") {
        // ensures the data has the required structure
        const safeData = {
          ...getDefaultAnalyticsData(),
          ...result.data,
          overview: {
            ...getDefaultAnalyticsData().overview,
            ...result.data.overview,
          },
        };
        setData(safeData);
      } else {
        console.warn("Invalid analytics data received:", result);
        setData(getDefaultAnalyticsData());
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setData(getDefaultAnalyticsData());
    } finally {
      setLoading(false);
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

  // ensure we always have valid data structure
  const safeData = data || getDefaultAnalyticsData();
  const overview = safeData.overview || getDefaultAnalyticsData().overview;

  if (!loading && overview.totalProjects === 0 && overview.totalTasks === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No analytics data available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by creating projects and tasks to see analytics.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // safety check for critical properties
  if (!overview) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900">
              Loading analytics...
            </h3>
            <div className="mt-2 animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completionRate =
    (overview.totalTasks || 0) > 0
      ? Math.round(
          ((overview.completedTasks || 0) / (overview.totalTasks || 1)) * 100
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track project progress, team performance, and productivity metrics
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* key metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {overview.totalProjects}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm">
                        <span className="text-green-600">
                          {overview.activeProjects} active
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Task Completion
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {completionRate}%
                      </div>
                      <div className="ml-2 flex items-baseline text-sm">
                        <span className="text-gray-600">
                          {overview.completedTasks}/{overview.totalTasks}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue Tasks
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {overview.overdueTasks}
                      </div>
                      {overview.overdueTasks > 0 && (
                        <div className="ml-2 flex items-baseline text-sm">
                          <span className="text-red-600">Needs attention</span>
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team Members
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {overview.teamMembers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* project status distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Projects by Status
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(safeData.projectsByStatus || {}).map(
                  ([status, count]) => {
                    const total = Object.values(
                      safeData.projectsByStatus || {}
                    ).reduce((a, b) => a + b, 0);
                    const percentage =
                      total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={status} className="flex items-center">
                        <div className="flex-1 flex items-center">
                          <span className="text-sm font-medium text-gray-900 capitalize w-20">
                            {status.replace("-", " ")}
                          </span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  status === "completed"
                                    ? "bg-green-500"
                                    : status === "active"
                                    ? "bg-blue-500"
                                    : status === "on-hold"
                                    ? "bg-yellow-500"
                                    : "bg-purple-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* task priority distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Tasks by Priority
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(safeData.tasksByPriority || {}).map(
                  ([priority, count]) => {
                    const total = Object.values(
                      safeData.tasksByPriority || {}
                    ).reduce((a, b) => a + b, 0);
                    const percentage =
                      total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={priority} className="flex items-center">
                        <div className="flex-1 flex items-center">
                          <span className="text-sm font-medium text-gray-900 capitalize w-20">
                            {priority}
                          </span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  priority === "critical"
                                    ? "bg-red-500"
                                    : priority === "high"
                                    ? "bg-orange-500"
                                    : priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* task status overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Task Status Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {Object.entries(safeData.tasksByStatus || {}).map(
                ([status, count]) => (
                  <div key={status} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        status === "completed"
                          ? "bg-green-100"
                          : status === "in-progress"
                          ? "bg-blue-100"
                          : status === "review"
                          ? "bg-yellow-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <span
                        className={`text-2xl font-bold ${
                          status === "completed"
                            ? "text-green-600"
                            : status === "in-progress"
                            ? "text-blue-600"
                            : status === "review"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {status.replace("-", " ")}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* top performers and recent activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* top performers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Top Performers
              </h3>
            </div>
            <div className="p-6">
              {(safeData.topPerformers || []).length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No performance data available
                </p>
              ) : (
                <div className="space-y-4">
                  {(safeData.topPerformers || [])
                    .slice(0, 5)
                    .map((performer, index) => (
                      <div key={performer.userId} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {performer.userName || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {performer.tasksCompleted} tasks completed
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(performer.completionRate)}%
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* recent activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {(safeData.recentActivity || []).length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {(safeData.recentActivity || [])
                    .slice(0, 5)
                    .map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            activity.type === "task_completed"
                              ? "bg-green-100"
                              : activity.type === "project_created"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {activity.type === "task_completed" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : activity.type === "project_created" ? (
                            <BarChart className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Calendar className="h-3 w-3 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.type === "task_completed" &&
                              "completed task"}
                            {activity.type === "project_created" &&
                              "created project"}
                            {activity.type === "task_created" && "created task"}{" "}
                            <span className="font-medium">
                              {activity.title}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            in {activity.project} •{" "}
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
