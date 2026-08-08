"use client";

import { Search, Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 dark:border-emerald-900/20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-colors">

      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="search-field"
            className="block h-full w-full rounded-lg border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-gray-900 py-0 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Search projects, tasks…"
            type="search"
            name="search"
          />
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-x-3 lg:gap-x-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-800" aria-hidden="true" />

        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
