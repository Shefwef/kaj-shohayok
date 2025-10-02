"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Award,
  RefreshCw,
  PlusCircle,
  Users,
} from "lucide-react";

interface AnalyticsData {
  projects: {
    total: number;
    active: number;
    completed: number;
    archived: number;
    averageProgress: number;
    byPriority: Record<string, number>;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    overdue: number;
    completionRate: string;
    byPriority: Record<string, number>;
  };
  recent: {
    projects: any[];
    tasks: any[];
  };
  productivity: Array<{
    _id: string;
    count: number;
    totalHours: number;
  }>;
}

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  gray: "#6B7280",
  indigo: "#6366F1",
  pink: "#EC4899",
  cyan: "#06B6D4",
  emerald: "#059669",
  violet: "#7C3AED",
  orange: "#F97316",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/analytics");
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">
            Loading analytics...
          </p>
          <p className="text-sm text-gray-500">
            Gathering insights from your data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center max-w-md">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Analytics Unavailable
          </h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
        <div className="text-center max-w-lg">
          <BarChart3 className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Your analytics dashboard is ready!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Create some projects and tasks to see comprehensive insights and
            visualizations
          </p>
          <div className="flex justify-center space-x-4">
            <Target className="h-8 w-8 text-blue-500" />
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  // Prepare comprehensive data for charts
  const projectStatusData = [
    {
      name: "Active",
      value: analytics.projects.active,
      color: COLORS.primary,
      icon: "🚀",
    },
    {
      name: "Completed",
      value: analytics.projects.completed,
      color: COLORS.success,
      icon: "✅",
    },
    {
      name: "Archived",
      value: analytics.projects.archived,
      color: COLORS.gray,
      icon: "📁",
    },
  ].filter((item) => item.value > 0);

  const taskStatusData = [
    {
      name: "Todo",
      value: analytics.tasks.todo,
      color: COLORS.warning,
      icon: "📋",
    },
    {
      name: "In Progress",
      value: analytics.tasks.inProgress,
      color: COLORS.primary,
      icon: "⚡",
    },
    {
      name: "Review",
      value: analytics.tasks.review,
      color: COLORS.purple,
      icon: "👀",
    },
    {
      name: "Done",
      value: analytics.tasks.done,
      color: COLORS.success,
      icon: "✨",
    },
  ].filter((item) => item.value > 0);

  const priorityData = [
    {
      name: "Low",
      tasks: analytics.tasks.byPriority?.low || 0,
      projects: analytics.projects.byPriority?.low || 0,
      color: COLORS.success,
      intensity: 25,
    },
    {
      name: "Medium",
      tasks: analytics.tasks.byPriority?.medium || 0,
      projects: analytics.projects.byPriority?.medium || 0,
      color: COLORS.warning,
      intensity: 50,
    },
    {
      name: "High",
      tasks: analytics.tasks.byPriority?.high || 0,
      projects: analytics.projects.byPriority?.high || 0,
      color: COLORS.danger,
      intensity: 75,
    },
    {
      name: "Critical",
      tasks: analytics.tasks.byPriority?.critical || 0,
      projects: analytics.projects.byPriority?.critical || 0,
      color: COLORS.purple,
      intensity: 100,
    },
  ];

  const completionRate = parseFloat(analytics.tasks.completionRate);
  const overallProductivity =
    analytics.productivity?.reduce((sum, day) => sum + day.count, 0) || 0;
  const averageDaily =
    analytics.productivity?.length > 0
      ? (overallProductivity / analytics.productivity.length).toFixed(1)
      : "0";

  // Enhanced productivity data with trends
  const enhancedProductivityData =
    analytics.productivity?.map((day, index) => ({
      ...day,
      date: new Date(day._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      trend:
        index > 0
          ? day.count - (analytics.productivity![index - 1]?.count || 0)
          : 0,
      efficiency:
        day.totalHours > 0 ? (day.count / day.totalHours).toFixed(1) : "0",
    })) || [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 lg:py-8">
          {/* Enhanced Header */}
          <div className="mb-4 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 lg:gap-3">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-600" />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1 lg:mt-2 text-sm sm:text-base lg:text-lg">
                  Comprehensive insights and performance metrics for your
                  workspace
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                </div>
                <button
                  onClick={fetchAnalytics}
                  className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">↻</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">
                      Projects
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {analytics.projects.total}
                    </p>
                    <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                      <Target className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {analytics.projects.active} active
                      </span>
                    </p>
                  </div>
                  <div className="bg-blue-400/30 rounded-full p-2 lg:p-3 flex-shrink-0">
                    <Target className="h-5 w-5 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-green-100 text-xs sm:text-sm font-medium truncate">
                      Tasks
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {analytics.tasks.total}
                    </p>
                    <p className="text-green-100 text-xs mt-1 flex items-center gap-1">
                      {completionRate >= 70 ? (
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {analytics.tasks.completionRate}% done
                      </span>
                    </p>
                  </div>
                  <div className="bg-green-400/30 rounded-full p-2 lg:p-3 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-red-100 text-xs sm:text-sm font-medium truncate">
                      Overdue
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {analytics.tasks.overdue}
                    </p>
                    <p className="text-red-100 text-xs mt-1 truncate">
                      {analytics.tasks.overdue > 0
                        ? "Need attention"
                        : "Up to date"}
                    </p>
                  </div>
                  <div className="bg-red-400/30 rounded-full p-2 lg:p-3 flex-shrink-0">
                    <Clock className="h-5 w-5 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">
                      Progress
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {analytics.projects.averageProgress?.toFixed(1) || 0}%
                    </p>
                    <div className="mt-2">
                      <div className="bg-purple-400/30 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-white rounded-full h-1.5 sm:h-2 transition-all duration-500"
                          style={{
                            width: `${
                              analytics.projects.averageProgress || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-400/30 rounded-full p-2 lg:p-3 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Projects</span>
                <span className="sm:hidden">Proj</span>
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:col-span-1"
              >
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="priority"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:col-span-1"
              >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Priority</span>
                <span className="sm:hidden">Pri</span>
              </TabsTrigger>
              <TabsTrigger
                value="productivity"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm col-span-2 sm:col-span-1"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Productivity</span>
                <span className="sm:hidden">Prod</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Enhanced Project Status Chart */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Target className="h-5 w-5 text-blue-600" />
                      Project Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {projectStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                0
                              )}%)`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {projectStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <Target className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg font-medium">No Project Data</p>
                          <p className="text-sm">
                            Create your first project to see insights
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Task Status Chart */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Task Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {taskStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                0
                              )}%)`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <CheckCircle2 className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg font-medium">No Task Data</p>
                          <p className="text-sm">
                            Create some tasks to see analytics
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Productivity Trend */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Productivity Trend Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Daily task completion and work hours over the last 7 days
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {enhancedProductivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={enhancedProductivityData}>
                        <defs>
                          <linearGradient
                            id="colorTasks"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorHours"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={COLORS.purple}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={COLORS.purple}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                          labelFormatter={(value) => `Date: ${value}`}
                          formatter={(value: any, name: string) => [
                            value,
                            name === "count"
                              ? "Tasks Completed"
                              : name === "totalHours"
                              ? "Hours Worked"
                              : "Efficiency (Tasks/Hour)",
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS.primary}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorTasks)"
                          name="Tasks Completed"
                        />
                        <Area
                          type="monotone"
                          dataKey="totalHours"
                          stroke={COLORS.purple}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorHours)"
                          name="Hours Worked"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[320px] text-gray-500">
                      <div className="text-center">
                        <Activity className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">
                          No Productivity Data
                        </p>
                        <p className="text-sm">
                          Complete some tasks to see trends
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Project Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projectStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectStatusData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill={COLORS.primary}
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No project data to display
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {analytics.recent.projects &&
                      analytics.recent.projects.length > 0 ? (
                        analytics.recent.projects.map((project: any) => (
                          <div
                            key={project._id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {project.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    project.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : project.status === "active"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {project.status}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    project.priority === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : project.priority === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : project.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {project.priority}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  project.createdAt
                                ).toLocaleDateString()}
                              </p>
                              <div className="text-sm font-medium text-purple-600 flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {project.progress || 0}% complete
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No Recent Projects</p>
                          <p className="text-sm mt-1">
                            Create your first project to get started
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Task Status Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {taskStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={taskStatusData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill={COLORS.success}
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No task data to display
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {analytics.recent.tasks &&
                      analytics.recent.tasks.length > 0 ? (
                        analytics.recent.tasks.slice(0, 6).map((task: any) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-100 hover:shadow-md transition-all"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {task.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {task.projectId?.name || "No Project"}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  task.status === "done"
                                    ? "bg-green-100 text-green-800"
                                    : task.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : task.status === "review"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No Recent Tasks</p>
                          <p className="text-sm mt-1">
                            Create your first task to get started
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="priority" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Priority Distribution Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="tasks"
                          fill={COLORS.primary}
                          name="Tasks"
                          radius={[3, 3, 0, 0]}
                        />
                        <Bar
                          dataKey="projects"
                          fill={COLORS.success}
                          name="Projects"
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle>Priority Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {priorityData.map((priority) => {
                        const total = priority.tasks + priority.projects;
                        const percentage =
                          total > 0
                            ? ((priority.tasks + priority.projects) /
                                (analytics.tasks.total +
                                  analytics.projects.total)) *
                              100
                            : 0;

                        return (
                          <div
                            key={priority.name}
                            className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                                  priority.name === "Critical"
                                    ? "bg-red-100 text-red-800"
                                    : priority.name === "High"
                                    ? "bg-orange-100 text-orange-800"
                                    : priority.name === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: priority.color }}
                                />
                                {priority.name}
                              </span>
                              <span className="text-sm text-gray-600 font-medium">
                                {percentage.toFixed(1)}% of total
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tasks:</span>
                                <span className="font-bold text-blue-600">
                                  {priority.tasks}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Projects:</span>
                                <span className="font-bold text-green-600">
                                  {priority.projects}
                                </span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {overallProductivity}
                    </div>
                    <p className="text-sm text-gray-600">Tasks This Week</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {averageDaily}
                    </div>
                    <p className="text-sm text-gray-600">Avg Daily Tasks</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {completionRate.toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Daily Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {enhancedProductivityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={enhancedProductivityData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis dataKey="date" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                            name="Tasks Completed"
                          />
                          <Line
                            type="monotone"
                            dataKey="totalHours"
                            stroke={COLORS.success}
                            strokeWidth={2}
                            dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                            name="Hours Worked"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <Activity className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg font-medium">
                            No Productivity Data
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Completion Rate Gauge */}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">
                          Overall Completion Rate
                        </h3>
                        <div className="relative inline-block">
                          <svg
                            className="w-36 h-36 transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={
                                completionRate >= 80
                                  ? COLORS.success
                                  : completionRate >= 60
                                  ? COLORS.warning
                                  : COLORS.danger
                              }
                              strokeWidth="3"
                              strokeDasharray={`${completionRate}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-2xl font-bold text-gray-700">
                                {completionRate.toFixed(0)}%
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                Complete
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Status */}
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                            completionRate >= 80
                              ? "bg-green-100 text-green-800"
                              : completionRate >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {completionRate >= 80 ? (
                            <>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Excellent Performance
                            </>
                          ) : completionRate >= 60 ? (
                            <>
                              <Activity className="h-4 w-4 mr-2" />
                              Good Performance
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 mr-2" />
                              Needs Improvement
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
