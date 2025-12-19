import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Processing...",
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg border border-border">
        <Spinner size="xl" className="text-primary" />
        <div className="space-y-2 text-center">
          <p
            id="loading-message"
            className="text-lg font-semibold text-foreground"
          >
            {message}
          </p>
          <p className="text-sm text-muted-foreground">
            This may take a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
