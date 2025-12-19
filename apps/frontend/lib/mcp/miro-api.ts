import type { Board, BoardContent, BoardElement } from "@/types";

const MIRO_API_BASE = "https://api.miro.com/v2";

interface MiroBoard {
  id: string;
  name: string;
  description?: string;
  modifiedAt: string;
  picture?: {
    imageURL?: string;
  };
}

interface MiroItem {
  id: string;
  type: string;
  data?: {
    content?: string;
    title?: string;
  };
  style?: {
    fillColor?: string;
  };
  position?: {
    x: number;
    y: number;
  };
  parent?: {
    id: string;
  };
}

interface MiroBoardsResponse {
  data: MiroBoard[];
  total: number;
  size: number;
  offset: number;
}

interface MiroItemsResponse {
  data: MiroItem[];
  total: number;
  size: number;
  cursor?: string;
}

export class MiroAPIClient {
  private apiKey: string;
  private baseUrl: string = MIRO_API_BASE;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    console.log(
      "[Miro API] Fetching:",
      `${this.apiKey}`,
      `${this.baseUrl}${endpoint}`
    );
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_1Um-KwCvt64ZHOeSyGkIFO6iDCQ`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Miro API] Error:", response.status, error);
      throw new Error(`Miro API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getBoardContent(boardId: string): Promise<BoardContent> {
    console.log("[Miro API] Getting board content:", boardId);
    try {
      // Get board details
      const board = await this.fetch<MiroBoard>(`/boards/${boardId}`);

      // Get all items from the board
      const items = await this.getAllBoardItems(boardId);

      // Convert to our format
      const elements: BoardElement[] = items
        .filter((item) =>
          ["sticky_note", "frame", "text", "shape"].includes(item.type)
        )
        .map((item) => ({
          id: item.id,
          type: this.mapItemType(item.type),
          content: item.data?.content || item.data?.title || "",
          parentFrameId: item.parent?.id,
          position: item.position,
          color: item.style?.fillColor,
        }))
        .filter((el) => el.content.trim() !== "");

      return {
        boardId: board.id,
        boardName: board.name,
        elements,
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Miro API] Failed to get board content:", error);
      throw error;
    }
  }

  private async getAllBoardItems(boardId: string): Promise<MiroItem[]> {
    const allItems: MiroItem[] = [];
    let cursor: string | undefined;

    do {
      const endpoint = cursor
        ? `/boards/${boardId}/items?limit=50&cursor=${cursor}`
        : `/boards/${boardId}/items?limit=50`;

      const response = await this.fetch<MiroItemsResponse>(endpoint);
      allItems.push(...response.data);
      cursor = response.cursor;
    } while (cursor);

    return allItems;
  }

  private mapItemType(miroType: string): BoardElement["type"] {
    const typeMap: Record<string, BoardElement["type"]> = {
      sticky_note: "sticky_note",
      frame: "frame",
      text: "text",
      shape: "shape",
    };
    return typeMap[miroType] || "text";
  }
}

// Singleton instance
let miroClient: MiroAPIClient | null = null;

export function getMiroClient(): MiroAPIClient {
  const apiKey = process.env.MIRO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "MIRO_API_KEY environment variable is not set. Please add it to your .env.local file."
    );
  }

  if (!miroClient) {
    miroClient = new MiroAPIClient(apiKey);
  }
  return miroClient;
}
