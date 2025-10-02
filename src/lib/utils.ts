import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API Response utility
export function createApiResponse(success: boolean, data: any, error?: string) {
  return {
    success,
    data,
    error: error || null,
    timestamp: new Date().toISOString(),
  };
}

// Date formatting utility
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Date and time formatting utility (alias for compatibility)
export function formatDateTime(date: string | Date): string {
  return formatDate(date);
}

// Priority color utility
export function getPriorityColor(priority: string | undefined | null): string {
  if (!priority) return "bg-gray-100 text-gray-800 border-gray-200";

  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Status color utility
export function getStatusColor(status: string | undefined | null): string {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  switch (status.toLowerCase()) {
    case "active":
    case "in_progress":
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "todo":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "review":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
    case "blocked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
