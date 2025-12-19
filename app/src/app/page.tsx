'use client';

import { useState } from 'react';
import { Zap, Circle, CheckCircle2 } from 'lucide-react';
import { BoardSelector } from '@/components/board-selector';
import { ProcessingStatus } from '@/components/processing-status';
import { ResultsDisplay } from '@/components/results-display';
import { ExportControls } from '@/components/export-controls';
import type { Board, ProcessingOutput, ProcessingStatus as StatusType } from '@/types';

export default function Home() {
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<StatusType>({
    step: 'idle',
    message: 'Select a board to begin',
    progress: 0,
  });
  const [results, setResults] = useState<ProcessingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!selectedBoard) return;

    setIsProcessing(true);
    setResults(null);
    setError(null);

    // Simulate status updates (in real app, would come from server-sent events)
    const statusUpdates: StatusType[] = [
      { step: 'connecting', message: 'Connecting to Miro...', progress: 10 },
      { step: 'reading', message: 'Reading board content...', progress: 25 },
      { step: 'analyzing', message: 'Analyzing with AI...', progress: 50 },
      { step: 'generating', message: 'Generating stories...', progress: 75 },
    ];

    let currentStep = 0;
    const updateInterval = setInterval(() => {
      if (currentStep < statusUpdates.length) {
        setStatus(statusUpdates[currentStep]);
        currentStep++;
      }
    }, 1000);

    try {
      const response = await fetch(`/api/process/${selectedBoard.id}`, {
        method: 'POST',
      });

      clearInterval(updateInterval);

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setStatus({ step: 'complete', message: 'Processing complete!', progress: 100 });
      } else {
        throw new Error(data.error?.message || 'Processing failed');
      }
    } catch (err) {
      clearInterval(updateInterval);
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setStatus({ step: 'error', message, progress: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Miro-to-Stories</h1>
              <p className="text-sm text-gray-500">AI-Powered Story Generation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 fill-green-500 text-green-500" />
            <span className="text-sm text-gray-600">Miro + Gemini AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Left Panel - Board Selector */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <BoardSelector
            selectedBoard={selectedBoard}
            onSelect={setSelectedBoard}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        </aside>

        {/* Right Panel - Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Status */}
            {(isProcessing || status.step !== 'idle') && (
              <ProcessingStatus status={status} />
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Results */}
            {results && (
              <>
                <ExportControls results={results} />
                <ResultsDisplay results={results} />
              </>
            )}

            {/* Empty State */}
            {!isProcessing && !results && status.step === 'idle' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <CheckCircle2 className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Process
                </h2>
                <p className="text-gray-500 max-w-md">
                  Select a Miro board from the left panel and click &quot;Process Board&quot; to
                  generate structured user stories with AI.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>Miro-to-Stories Framework v1.0</span>
          <span>Built with BMAD Method</span>
        </div>
      </footer>
    </div>
  );
}

