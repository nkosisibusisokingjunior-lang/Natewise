import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface text-slate-50 flex items-center justify-center">
        <LoadingSpinner fullScreen message="Authenticating..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
