"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Building,
  FileText,
  Sun,
  Moon,
  Bell,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Admin", href: "/dashboard/admin", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4 transition-colors">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <Building className="h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
          Kaj Shohayok
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
                          "h-6 w-6 shrink-0 transition-colors"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Bottom section */}
          <li className="mt-auto -mx-2 space-y-1">
            <Link
              href="/dashboard/notifications"
              className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Bell className="h-6 w-6 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              Notifications
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-6 w-6 shrink-0 text-yellow-500" />
              ) : (
                <Moon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
