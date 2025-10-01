import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/postgres";
import { createApiResponse } from "@/lib/utils";
import { withRateLimit } from "@/lib/rate-limit";
import { createOrganizationSchema } from "@/lib/validations/auth";
import { hasPermission, hasRole, ROLE_PERMISSIONS } from "@/lib/permissions";

// list organizations
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

    // admin privileges
    const isAdmin = await hasRole("admin");

    let organizations;
    if (isAdmin) {
      // admins can see all organizations
      organizations = await prisma.organization.findMany({
        include: {
          _count: {
            select: { users: true, roles: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // regular users can only see their own organization
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          organization: {
            include: {
              _count: {
                select: { users: true, roles: true },
              },
            },
          },
        },
      });

      organizations = user?.organization ? [user.organization] : [];
    }

    return NextResponse.json(createApiResponse(true, organizations));
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      createApiResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  }
}

// creating new organization
export async function POST(request: NextRequest) {
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

    // only admins can create organizations
    const isAdmin = await hasRole("admin");
    if (!isAdmin) {
      return NextResponse.json(
        createApiResponse(
          false,
          null,
          "Only administrators can create organizations"
        ),
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createOrganizationSchema.parse(body);

    // checking if organization slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        createApiResponse(false, null, "Organization slug already exists"),
        { status: 400 }
      );
    }

    // creating organization with default roles
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        settings: validatedData.settings || {},
      },
    });

    // creating default roles for the organization
    const defaultRoles = [
      {
        name: "admin",
        description: "Full administrative access",
        permissions: ROLE_PERMISSIONS.admin,
        organizationId: organization.id,
      },
      {
        name: "manager",
        description: "Project and team management",
        permissions: ROLE_PERMISSIONS.manager,
        organizationId: organization.id,
      },
      {
        name: "member",
        description: "Standard team member access",
        permissions: ROLE_PERMISSIONS.member,
        organizationId: organization.id,
      },
      {
        name: "viewer",
        description: "Read-only access",
        permissions: ROLE_PERMISSIONS.viewer,
        organizationId: organization.id,
      },
    ];

    await prisma.role.createMany({
      data: defaultRoles,
    });

    // fetching the created organization with roles
    const orgWithRoles = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: {
        roles: true,
        _count: {
          select: { users: true, roles: true },
        },
      },
    });

    return NextResponse.json(createApiResponse(true, orgWithRoles), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
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
