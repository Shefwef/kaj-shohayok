"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  LayoutGrid,
  Kanban,
  ListTodo,
  AreaChart,
  ClipboardList,
  ShieldCheck,
  BellDot,
  Sun,
  Moon,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard",  href: "/dashboard",            icon: LayoutGrid    },
  { name: "Projects",   href: "/dashboard/projects",   icon: Kanban        },
  { name: "Tasks",      href: "/dashboard/tasks",      icon: ListTodo      },
  { name: "Analytics",  href: "/dashboard/analytics",  icon: AreaChart     },
  { name: "Reports",    href: "/dashboard/reports",    icon: ClipboardList },
  { name: "Admin",      href: "/dashboard/admin",      icon: ShieldCheck   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-100 dark:border-emerald-900/20 bg-white dark:bg-gray-950 px-5 pb-4 transition-colors">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 shadow-lg shadow-emerald-500/25">
          <ClipboardCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Kaj Shohayok
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Menu
            </p>
            <ul role="list" className="-mx-2 space-y-0.5">
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
                          ? "bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-emerald-700 dark:hover:text-emerald-400",
                        "group flex gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-6 transition-all duration-150"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
                          "h-[1.15rem] w-[1.15rem] shrink-0 transition-colors"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Bottom section */}
          <li className="mt-auto -mx-2 space-y-0.5">
            <div className="mb-3 h-px bg-gray-100 dark:bg-emerald-900/20" />

            <Link
              href="/dashboard/notifications"
              className="group flex gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-6 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-150"
            >
              <BellDot className="h-[1.15rem] w-[1.15rem] shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              Notifications
            </Link>

            {/* Dark mode toggle — rendered only after mount to avoid hydration mismatch */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full group flex gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-6 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-150"
              suppressHydrationWarning
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-[1.15rem] w-[1.15rem] shrink-0 text-amber-400" />
              ) : (
                <Moon className="h-[1.15rem] w-[1.15rem] shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              )}
              <span suppressHydrationWarning>
                {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
