import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Project from "@/models/Project";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { updateProjectSchema } from "@/lib/validations/project";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), {
        status: 401,
      });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid project ID"),
        { status: 400 }
      );
    }

    await connectMongoDB();

    const project = await Project.findOne({
      _id: id,
      $or: [{ ownerId: userId }, { teamMembers: { $in: [userId] } }],
    }).lean();

    if (!project) {
      return NextResponse.json(
        createApiResponse(false, null, "Project not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(true, project));
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 30);
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), {
        status: 401,
      });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid project ID"),
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    await connectMongoDB();

    // Check if user has permission to update this project
    const existingProject = await Project.findOne({
      _id: id,
      ownerId: userId, // Only owner can update
    });

    if (!existingProject) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Project not found or insufficient permissions"
        ),
        { status: 404 }
      );
    }

    const updateData: any = { ...validatedData };
    if (validatedData.startDate)
      updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate)
      updateData.endDate = new Date(validatedData.endDate);

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    return NextResponse.json(createApiResponse(true, project));
  } catch (error) {
    console.error("Error updating project:", error);
    if (error instanceof Error) {
      return NextResponse.json(createApiResponse(false, null, error.message), {
        status: 400,
      });
    }
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 10);
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(createApiResponse(false, null, "Unauthorized"), {
        status: 401,
      });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        createApiResponse(false, null, "Invalid project ID"),
        { status: 400 }
      );
    }

    await connectMongoDB();

    // check if user has permission to delete
    const project = await Project.findOneAndDelete({
      _id: id,
      ownerId: userId, // owner can delete only
    });

    if (!project) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Project not found or insufficient permissions"
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, { message: "Project deleted successfully" })
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
