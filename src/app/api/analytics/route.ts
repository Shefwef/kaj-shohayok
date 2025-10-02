import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Task";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectMongoDB();

    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    }).lean();

    const projectIds = userProjects.map((p) => p._id);

    // Project statistics
    const projectStats = {
      total: userProjects.length,
      active: userProjects.filter((p) => p.status === "active").length,
      completed: userProjects.filter((p) => p.status === "completed").length,
      archived: userProjects.filter((p) => p.status === "archived").length,
    };

    // Project priority distribution
    const projectPriorityStats = userProjects.reduce((acc: any, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {});

    // Average project progress
    const avgProgress =
      userProjects.length > 0
        ? Math.round(
            userProjects.reduce((sum, p) => sum + (p.progress || 0), 0) /
              userProjects.length
          )
        : 0;

    // Get tasks for user's projects
    const tasks = await Task.find({
      projectId: { $in: projectIds },
    }).lean();

    // Task statistics
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    // Task priority distribution
    const taskPriorityStats = tasks.reduce((acc: any, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Overdue tasks
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "done"
    ).length;

    // Completion rate
    const completionRate =
      taskStats.total > 0
        ? ((taskStats.done / taskStats.total) * 100).toFixed(1)
        : "0";

    // Recent projects (last 5)
    const recentProjects = userProjects
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        status: p.status,
        progress: p.progress || 0,
        updatedAt: p.updatedAt,
      }));

    // Recent tasks (last 10)
    const recentTasks = await Task.find({
      projectId: { $in: projectIds },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("projectId", "name")
      .lean();

    // Productivity data (tasks completed per day for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const productivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completedCount = tasks.filter((task) => {
        if (task.status !== "done" || !task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt).toISOString().split("T")[0];
        return taskDate === dateStr;
      }).length;

      productivity.push({
        _id: dateStr,
        count: completedCount,
      });
    }

    // Format data for charts
    const analytics = {
      projects: {
        total: projectStats.total,
        active: projectStats.active,
        completed: projectStats.completed,
        archived: projectStats.archived,
        averageProgress: avgProgress,
        byPriority: projectPriorityStats,
      },
      tasks: {
        total: taskStats.total,
        todo: taskStats.todo,
        inProgress: taskStats.inProgress,
        review: taskStats.review,
        done: taskStats.done,
        overdue: overdueTasks,
        completionRate,
        byPriority: taskPriorityStats,
      },
      recent: {
        projects: recentProjects,
        tasks: recentTasks.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          updatedAt: t.updatedAt,
          projectName: (t.projectId as any)?.name || "Unknown",
        })),
      },
      productivity,
      charts: {
        projectStatus: [
          { name: "Active", value: projectStats.active, color: "#8884d8" },
          {
            name: "Completed",
            value: projectStats.completed,
            color: "#82ca9d",
          },
          { name: "Archived", value: projectStats.archived, color: "#ffc658" },
        ],
        taskStatus: [
          { name: "To Do", value: taskStats.todo, color: "#ff7300" },
          {
            name: "In Progress",
            value: taskStats.inProgress,
            color: "#387908",
          },
          { name: "Review", value: taskStats.review, color: "#ff7f0e" },
          { name: "Done", value: taskStats.done, color: "#2ca02c" },
        ],
        priorityDistribution: Object.entries({
          ...projectPriorityStats,
          ...taskPriorityStats,
        }).reduce((acc, [priority, count]) => {
          const existing = acc.find(
            (item) =>
              item.name === priority.charAt(0).toUpperCase() + priority.slice(1)
          );
          if (existing) {
            existing.value += count as number;
          } else {
            acc.push({
              name: priority.charAt(0).toUpperCase() + priority.slice(1),
              value: count as number,
              color:
                priority === "high" || priority === "critical"
                  ? "#d62728"
                  : priority === "medium"
                  ? "#ff7f0e"
                  : "#2ca02c",
            });
          }
          return acc;
        }, [] as Array<{ name: string; value: number; color: string }>),
      },
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal server error: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
