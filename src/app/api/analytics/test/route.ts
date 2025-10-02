import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/db/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { createApiResponse } from "@/lib/utils";

export async function GET() {
  try {
    await connectMongoDB();

    // Simple test without authentication to check if backend works
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    const analytics = {
      projects: {
        total: totalProjects,
        active: 0,
        completed: 0,
        archived: 0,
        averageProgress: 0,
        byPriority: {},
      },
      tasks: {
        total: totalTasks,
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        overdue: 0,
        completionRate: "0",
        byPriority: {},
      },
      recent: {
        projects: [],
        tasks: [],
      },
      productivity: [],
    };

    return NextResponse.json(createApiResponse(true, analytics));
  } catch (error) {
    console.error("Error fetching test analytics:", error);
    return NextResponse.json(
      createApiResponse(
        false,
        null,
        "Internal server error: " + (error as Error).message
      ),
      { status: 500 }
    );
  }
}
