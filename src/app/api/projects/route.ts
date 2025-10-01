import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/db/mongodb";
import Project from "@/models/Project";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET(request: NextRequest) {
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

    await connectMongoDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const search = url.searchParams.get("search");

    const query: any = {};

    // adding user filter to show projects where user is owner or team member
    query.$or = [{ ownerId: userId }, { teamMembers: { $in: [userId] } }];

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete query.$or;
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Project.countDocuments(query);

    return NextResponse.json(
      createApiResponse(true, {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 20);
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

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    await connectMongoDB();

    const project = await Project.create({
      ...validatedData,
      ownerId: userId,
      organizationId: "default", // need to get from user's organization yet
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate
        ? new Date(validatedData.endDate)
        : undefined,
    });

    return NextResponse.json(createApiResponse(true, project), { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
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
