import { NextResponse } from "next/server";import { NextResponse } from "next/server";import { NextResponse } from "next/server";import { NextResponse } from "next/server";import { NextRequest, NextResponse } from "next/server";/**



export async function GET() {

  return NextResponse.json({

    status: "healthy",export async function GET() {

    timestamp: new Date().toISOString(),

    message: "Analytics API server is running"  return NextResponse.json({

  });

}    status: "healthy",export async function GET() {

    timestamp: new Date().toISOString(),

    message: "Server is running"  try {

  });

}    const healthData = {export async function GET() { * 🏥 Health Check API Endpoint

      status: "healthy",

      timestamp: new Date().toISOString(),  try {

      uptime: process.uptime(),

      version: "1.0.0",    const healthData = {export async function GET() { * Provides system health status for Docker health checks and monitoring

      environment: process.env.NODE_ENV || "development",

      message: "Analytics API server is running successfully"      status: "healthy",

    };

      timestamp: new Date().toISOString(),  try { */

    return NextResponse.json(healthData, {

      status: 200,      uptime: process.uptime(),

      headers: {

        "Cache-Control": "no-cache, no-store, must-revalidate",      version: "1.0.0",    const healthData = {

        "Content-Type": "application/json",

      },      environment: process.env.NODE_ENV || "development",

    });

  } catch (error) {      message: "Analytics API server is running successfully"      status: "healthy",import { NextRequest, NextResponse } from "next/server";

    console.error("Health check failed:", error);

    return NextResponse.json(    };

      {

        status: "unhealthy",      timestamp: new Date().toISOString(),import { PrismaClient } from "@prisma/client";

        timestamp: new Date().toISOString(),

        error: error instanceof Error ? error.message : "Unknown error",    return NextResponse.json(healthData, {

      },

      { status: 503 }      status: 200,      uptime: process.uptime(),import mongoose from "mongoose";

    );

  }      headers: {

}
        "Cache-Control": "no-cache, no-store, must-revalidate",      version: "1.0.0",

        "Content-Type": "application/json",

      },      environment: process.env.NODE_ENV || "development",const prisma = new PrismaClient();

    });

  } catch (error) {      message: "Analytics API server is running successfully"

    console.error("Health check failed:", error);

    return NextResponse.json(    };export async function GET(request: NextRequest) {

      {

        status: "unhealthy",  try {

        timestamp: new Date().toISOString(),

        error: error instanceof Error ? error.message : "Unknown error",    return NextResponse.json(healthData, {    const startTime = Date.now();

      },

      { status: 503 }      status: 200,

    );

  }      headers: {    // Check application status

}
        "Cache-Control": "no-cache, no-store, must-revalidate",    const appStatus = {

        "Content-Type": "application/json",      status: "healthy",

      },      timestamp: new Date().toISOString(),

    });      uptime: process.uptime(),

  } catch (error) {      version: process.env.npm_package_version || "1.0.0",

    console.error("Health check failed:", error);      nodeVersion: process.version,

    return NextResponse.json(      environment: process.env.NODE_ENV || "development",

      {    };

        status: "unhealthy",

        timestamp: new Date().toISOString(),    // Check database connections

        error: error instanceof Error ? error.message : "Unknown error",    const databaseStatus = await checkDatabaseConnections();

      },

      { status: 503 }    // Check external services

    );    const servicesStatus = await checkExternalServices();

  }

}    // Calculate response time
    const responseTime = Date.now() - startTime;

    const healthData = {
      ...appStatus,
      responseTime: `${responseTime}ms`,
      databases: databaseStatus,
      services: servicesStatus,
      checks: {
        database:
          databaseStatus.postgres.connected && databaseStatus.mongodb.connected,
        services: checkRequiredServices(servicesStatus),
      },
    };

    // Determine overall health status - only databases are required for health
    const isHealthy = healthData.checks.database;

    return NextResponse.json(
      {
        ...healthData,
        status: isHealthy ? "healthy" : "unhealthy",
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      },
      { status: 503 }
    );
  }
}

/**
 * Check database connection status
 */
async function checkDatabaseConnections() {
  const status = {
    postgres: {
      connected: false,
      responseTime: 0,
      error: null as string | null,
    },
    mongodb: {
      connected: false,
      responseTime: 0,
      error: null as string | null,
    },
  };

  // Test PostgreSQL connection
  try {
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    status.postgres.connected = true;
    status.postgres.responseTime = Date.now() - pgStart;
  } catch (error) {
    status.postgres.error =
      error instanceof Error ? error.message : "Connection failed";
  }

  // Test MongoDB connection
  try {
    const mongoStart = Date.now();
    // Check if mongoose is connected
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      // Already connected
      status.mongodb.connected = true;
      status.mongodb.responseTime = Date.now() - mongoStart;
    } else {
      // Attempt to ping the database
      if (process.env.MONGODB_URI) {
        // Simple connection test
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        status.mongodb.connected = true;
        status.mongodb.responseTime = Date.now() - mongoStart;
      } else {
        status.mongodb.error = "MONGODB_URI not configured";
      }
    }
  } catch (error) {
    status.mongodb.error =
      error instanceof Error ? error.message : "Connection failed";
  }

  return status;
}

/**
 * Check if required services are healthy (optional services don't affect health)
 */
function checkRequiredServices(servicesStatus: any) {
  // Only Clerk is required for the application to function
  // Redis is optional and doesn't affect overall health
  const clerkHealthy = servicesStatus.clerk.status === "healthy" || 
                      servicesStatus.clerk.status === "not_configured";
  
  return clerkHealthy;
}

/**
 * Check external services status
 */
async function checkExternalServices() {
  const services = {
    clerk: { status: "unknown", responseTime: 0 },
    redis: { status: "unknown", responseTime: 0 },
  };

  // Check Clerk service availability
  try {
    const clerkStart = Date.now();
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (clerkKey && clerkKey.startsWith("pk_")) {
      services.clerk.status = "healthy";
      services.clerk.responseTime = Date.now() - clerkStart;
    } else {
      services.clerk.status = "not_configured";
    }
  } catch (error) {
    services.clerk.status = "unhealthy";
  }

  // Check Redis availability (if configured)
  try {
    const redisStart = Date.now();
    const redisUrl =
      process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (redisUrl) {
      services.redis.status = "configured";
      services.redis.responseTime = Date.now() - redisStart;
    } else {
      services.redis.status = "not_configured";
    }
  } catch (error) {
    services.redis.status = "unhealthy";
  }

  return services;
}

// Export for edge runtime compatibility
export const runtime = "nodejs";
