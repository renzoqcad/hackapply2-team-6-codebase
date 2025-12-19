import type { Board, BoardContent } from '@/types';
import { getMockBoards, getMockBoardContent } from './mock-data';
import { getMiroClient } from './miro-api';

// MCP Client - uses Miro API if available, otherwise mock data
class MiroMCPClient {
  private connected: boolean = false;
  private useMock: boolean = true;

  constructor() {
    // Check if Miro API is enabled via environment
    this.useMock = process.env.MIRO_ENABLED !== 'true' || !process.env.MIRO_API_KEY;
  }

  async connect(): Promise<boolean> {
    if (this.useMock) {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.connected = true;
      console.log('[MCP] Using mock data mode');
      return true;
    }

    try {
      // Test Miro API connection
      const miroClient = getMiroClient();
      if (miroClient) {
        console.log('[MCP] Connected to Miro API');
        this.connected = true;
        return true;
      }
      
      // Fall back to mock
      console.log('[MCP] Miro API not available, using mock data');
      this.useMock = true;
      this.connected = true;
      return true;
    } catch (error) {
      console.error('[MCP] Connection failed:', error);
      // Fall back to mock on error
      this.useMock = true;
      this.connected = true;
      return true;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[MCP] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  isUsingMock(): boolean {
    return this.useMock;
  }

  async listBoards(): Promise<Board[]> {
    if (!this.connected) {
      await this.connect();
    }

    if (this.useMock) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockBoards();
    }

    // Use real Miro API
    const miroClient = getMiroClient();
    if (miroClient) {
      try {
        return await miroClient.listBoards();
      } catch (error) {
        console.error('[MCP] Miro API failed, falling back to mock:', error);
        return getMockBoards();
      }
    }

    return getMockBoards();
  }

  async getBoardContent(boardId: string): Promise<BoardContent | null> {
    if (!this.connected) {
      await this.connect();
    }

    if (this.useMock) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockBoardContent(boardId);
    }

    // Use real Miro API
    const miroClient = getMiroClient();
    if (miroClient) {
      try {
        return await miroClient.getBoardContent(boardId);
      } catch (error) {
        console.error('[MCP] Miro API failed, falling back to mock:', error);
        return getMockBoardContent(boardId);
      }
    }

    return getMockBoardContent(boardId);
  }
}

// Singleton instance
let mcpClient: MiroMCPClient | null = null;

export function getMCPClient(): MiroMCPClient {
  if (!mcpClient) {
    mcpClient = new MiroMCPClient();
  }
  return mcpClient;
}

export { MiroMCPClient };
