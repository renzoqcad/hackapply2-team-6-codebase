'use client';

import { Loader2, CheckCircle, XCircle, Zap, FileSearch, Brain, Sparkles } from 'lucide-react';
import type { ProcessingStatus as StatusType } from '@/types';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: StatusType;
}

const STEP_ICONS = {
  idle: Zap,
  connecting: Zap,
  reading: FileSearch,
  analyzing: Brain,
  generating: Sparkles,
  complete: CheckCircle,
  error: XCircle,
};

const STEP_LABELS = {
  idle: 'Ready',
  connecting: 'Connecting to Miro',
  reading: 'Reading board content',
  analyzing: 'Analyzing with AI',
  generating: 'Generating stories',
  complete: 'Complete',
  error: 'Error',
};

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const Icon = STEP_ICONS[status.step];
  const isActive = !['idle', 'complete', 'error'].includes(status.step);
  const isComplete = status.step === 'complete';
  const isError = status.step === 'error';

  return (
    <div
      className={cn(
        'rounded-lg p-4 transition-all',
        isActive && 'bg-primary-50 border border-primary-200',
        isComplete && 'bg-green-50 border border-green-200',
        isError && 'bg-red-50 border border-red-200'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-full',
            isActive && 'bg-primary-100',
            isComplete && 'bg-green-100',
            isError && 'bg-red-100'
          )}
        >
          {isActive ? (
            <Loader2
              className={cn('w-5 h-5 animate-spin', isActive && 'text-primary-600')}
            />
          ) : (
            <Icon
              className={cn(
                'w-5 h-5',
                isComplete && 'text-green-600',
                isError && 'text-red-600'
              )}
            />
          )}
        </div>
        <div className="flex-1">
          <p
            className={cn(
              'font-medium',
              isActive && 'text-primary-700',
              isComplete && 'text-green-700',
              isError && 'text-red-700'
            )}
          >
            {STEP_LABELS[status.step]}
          </p>
          <p className="text-sm text-gray-500">{status.message}</p>
        </div>
        {isActive && (
          <span className="text-sm font-medium text-primary-600">{status.progress}%</span>
        )}
      </div>

      {isActive && (
        <div className="mt-3 h-2 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

