"use client";

import { useEffect, useState } from "react";
import { Kanban, CircleCheckBig, AlarmClock, TrendingUp } from "lucide-react";

interface Analytics {
  projects: { total: number; active: number; completed: number; archived: number; averageProgress: number };
  tasks: { total: number; todo: number; inProgress: number; review: number; done: number; overdue: number; completionRate: string };
}

const skeletonCard = (
  <div className="animate-pulse rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-7 w-16 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
    <div className="mt-4 h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
  </div>
);

export default function DashboardStats() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnalytics(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i}>{skeletonCard}</div>)}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 text-center shadow-sm">
        <p className="text-gray-500 dark:text-gray-400">Unable to load analytics data</p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Projects",
      value: analytics.projects.total,
      sub: `${analytics.projects.active} active`,
      type: "neutral" as const,
      icon: Kanban,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-100 dark:ring-emerald-900/30",
    },
    {
      name: "Total Tasks",
      value: analytics.tasks.total,
      sub: `${analytics.tasks.done} completed`,
      type: "positive" as const,
      icon: CircleCheckBig,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-100 dark:ring-emerald-900/30",
    },
    {
      name: "Overdue Tasks",
      value: analytics.tasks.overdue,
      sub: analytics.tasks.overdue > 0 ? "Need attention" : "All on time",
      type: analytics.tasks.overdue > 0 ? "negative" as const : "neutral" as const,
      icon: AlarmClock,
      iconBg: analytics.tasks.overdue > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: analytics.tasks.overdue > 0 ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
      ring: analytics.tasks.overdue > 0 ? "ring-red-100 dark:ring-red-900/30" : "ring-emerald-100 dark:ring-emerald-900/30",
    },
    {
      name: "Completion Rate",
      value: `${analytics.tasks.completionRate}%`,
      sub: "Overall progress",
      type: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-100 dark:ring-emerald-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="group rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${stat.iconBg} ${stat.ring} shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                stat.type === "positive" ? "bg-emerald-500" : stat.type === "negative" ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            <p className={`text-xs font-medium ${
              stat.type === "positive" ? "text-emerald-600 dark:text-emerald-400" :
              stat.type === "negative" ? "text-red-500 dark:text-red-400" :
              "text-gray-500 dark:text-gray-400"
            }`}>
              {stat.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
