import { NextResponse } from "next/server";
import { getMiroClient } from "@/lib/mcp/miro-api";

export async function GET() {
  try {
    const useMiro = process.env.MIRO_ENABLED === "true";

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      miro: {
        enabled: useMiro,
        connected: false,
        hasApiKey: !!process.env.MIRO_API_KEY,
      },
    };

    // Test Miro connection if enabled
    if (useMiro) {
      try {
        const miroClient = getMiroClient(); // Will throw if no API key
        health.miro.connected = true;
      } catch (error) {
        console.error("[Health] Miro connection test failed:", error);
        health.status = "degraded";
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
