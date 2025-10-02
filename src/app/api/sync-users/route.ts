/**
 * Manually sync users from Clerk to PostgreSQL without webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/postgres";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting user sync from Clerk to PostgreSQL...");

    // Get all users from Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList();
    console.log(`📊 Found ${clerkUsers.data.length} users in Clerk`);

    // Get default role and organization
    const defaultRole = await prisma.role.findFirst({
      where: { name: "member" },
    });

    const defaultOrg = await prisma.organization.findFirst({
      where: { slug: "default" },
    });

    if (!defaultRole || !defaultOrg) {
      return NextResponse.json(
        { error: "Default role or organization not found" },
        { status: 400 }
      );
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each Clerk user
    for (const clerkUser of clerkUsers.data) {
      try {
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        if (!email) {
          console.log(`⚠️ Skipping user ${clerkUser.id} - no email`);
          skippedCount++;
          continue;
        }

        // Check if user already exists in PostgreSQL
        const existingUser = await prisma.user.findFirst({
          where: { clerkId: clerkUser.id },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: email,
              firstName: clerkUser.firstName || "",
              lastName: clerkUser.lastName || "",
              avatarUrl: clerkUser.imageUrl || null,
            },
          });
          console.log(`🔄 Updated user: ${email}`);
          updatedCount++;
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              email: email,
              firstName: clerkUser.firstName || "",
              lastName: clerkUser.lastName || "",
              avatarUrl: clerkUser.imageUrl || null,
              roleId: defaultRole.id,
              organizationId: defaultOrg.id,
            },
          });
          console.log(`✅ Created user: ${email}`);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${clerkUser.id}:`, error);
      }
    }

    const summary = {
      total: clerkUsers.data.length,
      created: syncedCount,
      updated: updatedCount,
      skipped: skippedCount,
    };

    console.log("🎉 Sync completed!", summary);

    return NextResponse.json({
      success: true,
      message: "Users synced successfully",
      summary,
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync users" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "User sync endpoint. Use POST to trigger sync.",
    usage: "POST /api/sync-users",
  });
}
