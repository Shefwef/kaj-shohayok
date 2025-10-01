import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/postgres";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { updateRoleSchema } from "@/lib/validations/auth";
import { hasPermission } from "@/lib/permissions";

// getting role by id
export async function GET(
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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        createApiResponse(false, null, "Role not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(true, role));
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

// updating role
export async function PUT(
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

    // checking if user has permission to manage roles
    const canManageRoles = await hasPermission("manage:roles");
    if (!canManageRoles) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // checking if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        createApiResponse(false, null, "Role not found"),
        { status: 404 }
      );
    }

    // checking if role name conflicts
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameConflict = await prisma.role.findFirst({
        where: {
          name: validatedData.name,
          organizationId: existingRole.organizationId,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          createApiResponse(false, null, "Role name already exists"),
          { status: 400 }
        );
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.permissions && {
          permissions: validatedData.permissions,
        }),
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

    return NextResponse.json(createApiResponse(true, updatedRole));
  } catch (error) {
    console.error("Error updating role:", error);
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

// deleting role
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

    // Check if user has permission to manage roles
    const canManageRoles = await hasPermission("manage:roles");
    if (!canManageRoles) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if role exists and has users
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        createApiResponse(false, null, "Role not found"),
        { status: 404 }
      );
    }

    // Prevent deletion if role has assigned users
    if (role._count.users > 0) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Cannot delete role with assigned users. Please reassign users first."
        ),
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(true, { message: "Role deleted successfully" })
    );
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
