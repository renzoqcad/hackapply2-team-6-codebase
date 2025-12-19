'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { Board } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface BoardSelectorProps {
  selectedBoard: Board | null;
  onSelect: (board: Board) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export function BoardSelector({
  selectedBoard,
  onSelect,
  onProcess,
  isProcessing,
}: BoardSelectorProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBoards() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/boards');
        const data = await response.json();

        if (data.success) {
          setBoards(data.data.boards);
        } else {
          setError(data.error?.message || 'Failed to fetch boards');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading boards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-red-500">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="text-center">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Miro Boards</h2>
        <p className="text-sm text-gray-500 mt-1">Select a board to process</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {boards.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No boards available</p>
        ) : (
          boards.map((board) => (
            <Card
              key={board.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary-300 hover:shadow',
                selectedBoard?.id === board.id && 'border-primary-500 bg-primary-50 shadow'
              )}
              onClick={() => onSelect(board)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{board.name}</h3>
                    {board.description && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">{board.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(board.lastModified)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button
          className="w-full"
          size="lg"
          disabled={!selectedBoard || isProcessing}
          onClick={onProcess}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Board'
          )}
        </Button>
      </div>
    </div>
  );
}

