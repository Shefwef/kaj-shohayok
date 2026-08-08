/**
 * 🔗 Webhook Test Endpoint
 * Simple test endpoint to verify ngrok connection
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "✅ Webhook endpoint is accessible!",
    timestamp: new Date().toISOString(),
    url: request.url,
  });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    message: "✅ POST request received!",
    timestamp: new Date().toISOString(),
  });
}
