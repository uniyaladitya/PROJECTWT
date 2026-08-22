"use client";

import React from "react";
import { AlertCircle, CheckCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "./Button";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <LoaderCircle className="text-primary h-8 w-8 animate-spin" aria-hidden="true" />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-background/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-card border-border rounded-lg border p-8 shadow-lg">{content}</div>
      </div>
    );
  }

  return content;
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 rounded-lg border px-6 py-12">
      <AlertCircle className="text-destructive h-10 w-10" aria-hidden="true" />
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Get started by creating something new",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-12">
      {icon || <Inbox className="text-muted-foreground h-10 w-10" aria-hidden="true" />}
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      </div>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

interface SuccessStateProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

export function SuccessState({
  title = "Success!",
  message = "Operation completed",
  onClose,
}: SuccessStateProps) {
  return (
    <div className="border-accent/30 bg-accent/10 flex flex-col items-center justify-center gap-4 rounded-lg border px-6 py-12">
      <CheckCircle className="text-accent-foreground h-10 w-10" aria-hidden="true" />
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{message}</p>
      </div>
      {onClose && (
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      )}
    </div>
  );
}
