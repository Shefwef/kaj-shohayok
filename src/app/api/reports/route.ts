import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { projectRepo, taskRepo } from "@/lib/container";
import { ReportFactory } from "@/services/ReportService";
import { withRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 5);
    if (!rateCheck.success) {
      return new NextResponse(rateCheck.error ?? "Rate limited", { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const format = (url.searchParams.get("format") as "json" | "csv") ?? "csv";
    const type = url.searchParams.get("type") ?? "summary";

    const projectIds = await projectRepo.findAccessibleIds(userId);
    const projects = await projectRepo.findByUser(userId);

    const allTasks: any[] = [];
    for (const pid of projectIds.slice(0, 20)) {
      const t = await taskRepo.findByProject(pid);
      allTasks.push(...t);
    }

    const done = allTasks.filter((t) => t.status === "done").length;
    const overdue = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;

    const reportData = {
      title: `Kaj Shohayok — ${type === "summary" ? "Project Summary" : "Team Report"}`,
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        to: new Date().toISOString().split("T")[0],
      },
      summary: {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        completedProjects: projects.filter((p) => p.status === "completed").length,
        totalTasks: allTasks.length,
        completedTasks: done,
        overdueTasks: overdue,
        completionRate: allTasks.length > 0 ? `${((done / allTasks.length) * 100).toFixed(1)}%` : "0%",
      },
      projects: projects.slice(0, 50),
      tasks: allTasks.slice(0, 200),
    };

    const generator = ReportFactory.create(format);
    const content = generator.generate(reportData);
    const filename = `kaj-shohayok-report-${Date.now()}.${generator.extension}`;

    return new NextResponse(content as string, {
      headers: {
        "Content-Type": generator.mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
