import { NextResponse } from "next/server";
import { getMiroClient } from "@/lib/mcp/miro-api";
import { getMockBoards } from "@/lib/mcp/mock-data";

export async function GET() {
  try {
    const useMiro = process.env.MIRO_ENABLED === "true";

    let boards;

    if (useMiro) {
      // getMiroClient will throw if MIRO_API_KEY is not set
      const miroClient = getMiroClient();
      boards = await miroClient.listBoards();
    } else {
      boards = getMockBoards();
    }

    return NextResponse.json({
      success: true,
      data: { boards },
    });
  } catch (error) {
    console.error("[API] Failed to fetch boards:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BOARDS_FETCH_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to fetch boards",
        },
      },
      { status: 500 }
    );
  }
}
