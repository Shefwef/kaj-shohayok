import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/postgres";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { updateOrganizationSchema } from "@/lib/validations/auth";
import { hasRole, isOrganizationAdmin } from "@/lib/permissions";

// organization by ID
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

    // checking access permissions
    const isAdmin = await hasRole("admin");
    const isOrgAdmin = await isOrganizationAdmin(id);

    if (!isAdmin && !isOrgAdmin) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: {
              select: { name: true, permissions: true },
            },
            createdAt: true,
          },
        },
        roles: {
          include: {
            _count: {
              select: { users: true },
            },
          },
        },
        _count: {
          select: { users: true, roles: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        createApiResponse(false, null, "Organization not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse(true, organization));
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

// updating organization
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

    const { id } = await params;

    // checking access permissions
    const isAdmin = await hasRole("admin");
    const isOrgAdmin = await isOrganizationAdmin(id);

    if (!isAdmin && !isOrgAdmin) {
      return NextResponse.json(
        createApiResponse(false, null, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateOrganizationSchema.parse(body);

    // checking if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        createApiResponse(false, null, "Organization not found"),
        { status: 404 }
      );
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.settings && { settings: validatedData.settings }),
      },
      include: {
        _count: {
          select: { users: true, roles: true },
        },
      },
    });

    return NextResponse.json(createApiResponse(true, updatedOrg));
  } catch (error) {
    console.error("Error updating organization:", error);
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

// delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateCheck = await withRateLimit(request, 5);
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

    // super admins can delete organizations
    const isAdmin = await hasRole("admin");
    if (!isAdmin) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Only administrators can delete organizations"
        ),
        { status: 403 }
      );
    }

    const { id } = await params;

    // checking if organization exists and has users
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        createApiResponse(false, null, "Organization not found"),
        { status: 404 }
      );
    }

    // preventing deletion if organization has users
    if (org._count.users > 0) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Cannot delete organization with users. Please transfer users first."
        ),
        { status: 400 }
      );
    }

    // deleting organization (this will cascade delete roles)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(true, { message: "Organization deleted successfully" })
    );
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}
