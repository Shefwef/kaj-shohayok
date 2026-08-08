import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    const appStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    };

    const databaseStatus = await checkDatabaseConnections();
    const servicesStatus = await checkExternalServices();
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

    const isHealthy = healthData.checks.database;

    return NextResponse.json(
      { ...healthData, status: isHealthy ? "healthy" : "degraded" },
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

  try {
    const pgStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    status.postgres.connected = true;
    status.postgres.responseTime = Date.now() - pgStart;
  } catch (error) {
    status.postgres.error =
      error instanceof Error ? error.message : "Connection failed";
  }

  try {
    const mongoStart = Date.now();
    if (mongoose.connection.readyState === 1) {
      status.mongodb.connected = true;
      status.mongodb.responseTime = Date.now() - mongoStart;
    } else if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      status.mongodb.connected = true;
      status.mongodb.responseTime = Date.now() - mongoStart;
    } else {
      status.mongodb.error = "MONGODB_URI not configured";
    }
  } catch (error) {
    status.mongodb.error =
      error instanceof Error ? error.message : "Connection failed";
  }

  return status;
}

function checkRequiredServices(servicesStatus: any) {
  return (
    servicesStatus.clerk.status === "healthy" ||
    servicesStatus.clerk.status === "not_configured"
  );
}

async function checkExternalServices() {
  const services = {
    clerk: { status: "unknown", responseTime: 0 },
    redis: { status: "unknown", responseTime: 0 },
    gemini: { status: "unknown", responseTime: 0 },
  };

  try {
    const clerkStart = Date.now();
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    services.clerk.status =
      clerkKey && clerkKey.startsWith("pk_") ? "healthy" : "not_configured";
    services.clerk.responseTime = Date.now() - clerkStart;
  } catch {
    services.clerk.status = "unhealthy";
  }

  try {
    const redisStart = Date.now();
    const redisUrl =
      process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    services.redis.status = redisUrl ? "configured" : "not_configured";
    services.redis.responseTime = Date.now() - redisStart;
  } catch {
    services.redis.status = "unhealthy";
  }

  try {
    const geminiStart = Date.now();
    services.gemini.status = process.env.GEMINI_API_KEY
      ? "configured"
      : "not_configured";
    services.gemini.responseTime = Date.now() - geminiStart;
  } catch {
    services.gemini.status = "unhealthy";
  }

  return services;
}
