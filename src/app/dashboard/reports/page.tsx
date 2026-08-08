"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Download,
  BarChart3,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";

type ReportType = "summary" | "team";
type ReportFormat = "csv" | "json";

const reportTypes = [
  {
    id: "summary" as ReportType,
    label: "Project Summary",
    description: "Task counts by status, completion rate, overdue tasks",
    icon: BarChart3,
  },
  {
    id: "team" as ReportType,
    label: "Team Report",
    description: "Tasks per assignee, workload distribution",
    icon: Users,
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("summary");
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("csv");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const url = `/api/reports?type=${selectedType}&format=${selectedFormat}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        alert(`Failed to generate report: ${text}`);
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `report.${selectedFormat}`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      alert("An error occurred while generating the report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (type: "tasks" | "projects", format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/export?type=${type}&format=${format}`);
      if (!response.ok) return;

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `${type}.${format}`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      alert("Export failed.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download detailed reports about your projects and tasks.
          </p>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map((rt) => (
                  <button
                    key={rt.id}
                    onClick={() => setSelectedType(rt.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedType === rt.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <rt.icon
                        className={`h-5 w-5 ${
                          selectedType === rt.id ? "text-indigo-600" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {rt.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {rt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <div className="flex gap-3">
                {(["csv", "json"] as ReportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedFormat === fmt
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generating ? "Generating..." : "Generate & Download"}
            </button>
          </CardContent>
        </Card>

        {/* Quick Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" />
              Quick Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Tasks (CSV)", type: "tasks" as const, format: "csv" as const },
                { label: "Tasks (JSON)", type: "tasks" as const, format: "json" as const },
                { label: "Projects (CSV)", type: "projects" as const, format: "csv" as const },
                { label: "Projects (JSON)", type: "projects" as const, format: "json" as const },
              ].map((item) => (
                <button
                  key={`${item.type}-${item.format}`}
                  onClick={() => handleExport(item.type, item.format)}
                  className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                  {item.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200">
                  Report Coverage
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Reports include all projects and tasks you have access to. The Project Summary
                  report covers the last 30 days of activity. Data is exported in real-time
                  from the live database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
