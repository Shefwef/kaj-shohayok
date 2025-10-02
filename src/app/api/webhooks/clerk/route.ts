import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/postgres";

export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload = await request.json();
    const eventType = payload.type;
    const userData = payload.data;

    console.log(`🔔 Webhook received: ${eventType}`);

    // Handle different webhook events
    switch (eventType) {
      case "user.created":
        await handleUserCreated(userData);
        break;
      case "user.updated":
        await handleUserUpdated(userData);
        break;
      case "user.deleted":
        await handleUserDeleted(userData);
        break;
      default:
        console.log(`⚠️ Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: any) {
  try {
    console.log("Creating user in database:", userData.id);

    // Get default member role
    const defaultRole = await prisma.role.findFirst({
      where: { name: "member" },
    });

    // Get default organization
    const defaultOrg = await prisma.organization.findFirst({
      where: { slug: "default" },
    });

    // Create user in database
    await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: userData.email_addresses?.[0]?.email_address || "",
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        avatarUrl: userData.image_url || null,
        roleId: defaultRole?.id || null,
        organizationId: defaultOrg?.id || null,
      },
    });

    console.log("✅ User created in database");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log("Updating user in database:", userData.id);

    await prisma.user.updateMany({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses?.[0]?.email_address || "",
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        avatarUrl: userData.image_url || null,
      },
    });

    console.log("✅ User updated in database");
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log("Deleting user from database:", userData.id);

    await prisma.user.deleteMany({
      where: { clerkId: userData.id },
    });

    console.log("✅ User deleted from database");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}
