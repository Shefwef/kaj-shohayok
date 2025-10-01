import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/postgres";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { createRoleSchema } from "@/lib/validations/auth";
import { hasPermission } from "@/lib/permissions";

// listing all roles
export async function GET(request: NextRequest) {
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

    // checking if user has permission to manage roles
    const canManageRoles = await hasPermission("manage:roles");
    if (!canManageRoles) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    const roles = await prisma.role.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        _count: {
          select: { users: true },
        },
        organization: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(createApiResponse(true, roles));
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

// creating new role
export async function POST(request: NextRequest) {
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

    // checking if user has permission to manage roles
    const canManageRoles = await hasPermission("manage:roles");
    if (!canManageRoles) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRoleSchema.parse(body);

    // checking if role name already exists in the organization
    const existingRole = await prisma.role.findFirst({
      where: {
        name: validatedData.name,
        organizationId: validatedData.organizationId || null,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        createApiResponse(false, null, "Role name already exists"),
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: validatedData.permissions,
        organizationId: validatedData.organizationId,
      },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(createApiResponse(true, role), { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
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
