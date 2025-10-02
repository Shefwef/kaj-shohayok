import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";

import QuickActions from "@/components/dashboard/QuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your projects.
            </p>
          </div>
        </div>

        {/* quick actions */}
        <Suspense
          fallback={
            <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          }
        >
          <QuickActions />
        </Suspense>

        {/* stats overview */}
        <Suspense
          fallback={
            <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
          }
        >
          <DashboardStats />
        </Suspense>

        {/* recent activity */}
        <Suspense
          fallback={
            <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>
          }
        >
          <RecentActivity />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
