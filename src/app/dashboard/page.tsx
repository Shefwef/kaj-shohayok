import { Suspense } from "react";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardLayout from "@/components/layout/DashboardLayout";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20 p-6 shadow-sm h-28" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back — here's an overview of your projects and tasks.
          </p>
        </div>

        {/* Quick actions */}
        <Suspense fallback={<div className="animate-pulse h-32 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20" />}>
          <QuickActions />
        </Suspense>

        {/* Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        {/* Recent activity */}
        <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-emerald-900/20" />}>
          <RecentActivity />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
