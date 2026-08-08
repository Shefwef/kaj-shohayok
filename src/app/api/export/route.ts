import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { projectRepo, taskRepo } from "@/lib/container";
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
    const format = url.searchParams.get("format") ?? "json";
    const type = url.searchParams.get("type") ?? "tasks";
    const projectId = url.searchParams.get("projectId");

    const projectIds = await projectRepo.findAccessibleIds(userId);

    if (type === "tasks") {
      let tasks: any[] = [];
      if (projectId && projectIds.includes(projectId)) {
        tasks = await taskRepo.findByProject(projectId);
      } else {
        for (const pid of projectIds.slice(0, 20)) {
          const t = await taskRepo.findByProject(pid);
          tasks.push(...t);
        }
      }

      if (format === "csv") {
        const headers = "ID,Title,Status,Priority,AssigneeId,DueDate,CreatedAt";
        const rows = tasks.map((t) =>
          [
            t._id,
            `"${t.title.replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.assigneeId || "",
            t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
            new Date(t.createdAt).toISOString().split("T")[0],
          ].join(",")
        );
        const csv = [headers, ...rows].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="tasks-${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({ tasks, exportedAt: new Date().toISOString(), total: tasks.length });
    }

    if (type === "projects") {
      const projects = await projectRepo.findByUser(userId);
      if (format === "csv") {
        const headers = "ID,Name,Status,Priority,Progress,StartDate,EndDate";
        const rows = projects.map((p) =>
          [
            p._id,
            `"${p.name.replace(/"/g, '""')}"`,
            p.status,
            p.priority,
            p.progress,
            new Date(p.startDate).toISOString().split("T")[0],
            p.endDate ? new Date(p.endDate).toISOString().split("T")[0] : "",
          ].join(",")
        );
        const csv = [headers, ...rows].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="projects-${Date.now()}.csv"`,
          },
        });
      }
      return NextResponse.json({ projects, exportedAt: new Date().toISOString(), total: projects.length });
    }

    return new NextResponse("Invalid type. Use 'tasks' or 'projects'.", { status: 400 });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
