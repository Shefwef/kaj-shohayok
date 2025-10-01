"use client";

import { useEffect, useState } from "react";
import { FolderKanban, CheckSquare, Clock, TrendingUp } from "lucide-react";

interface Analytics {
  projects: {
    total: number;
    active: number;
    completed: number;
    archived: number;
    averageProgress: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    overdue: number;
    completionRate: string;
  };
}

export default function DashboardStats() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Projects",
      value: analytics.projects.total,
      change: `${analytics.projects.active} active`,
      changeType: "neutral",
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Total Tasks",
      value: analytics.tasks.total,
      change: `${analytics.tasks.done} completed`,
      changeType: "positive",
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Overdue Tasks",
      value: analytics.tasks.overdue,
      change: "Need attention",
      changeType: analytics.tasks.overdue > 0 ? "negative" : "neutral",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Completion Rate",
      value: `${analytics.tasks.completionRate}%`,
      change: "Overall progress",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`inline-flex p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p
              className={`text-sm ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : stat.changeType === "negative"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
