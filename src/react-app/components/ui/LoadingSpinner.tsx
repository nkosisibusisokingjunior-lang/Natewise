import type { ReactNode } from "react";
import { GlassCard } from "@/react-app/components/ui/GlassCard";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  icon?: ReactNode;
}

export function LoadingSpinner({
  message = "Loading...",
  fullScreen = false,
  icon,
}: LoadingSpinnerProps) {
  const content = (
    <GlassCard className="flex items-center gap-4 p-6 justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-50">{message}</p>
        <p className="text-xs text-slate-400">
          Please wait while we fetch your data.
        </p>
      </div>
      {icon && <div className="ml-2">{icon}</div>}
    </GlassCard>
  );

  if (!fullScreen) return content;

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      {content}
    </div>
  );
}
