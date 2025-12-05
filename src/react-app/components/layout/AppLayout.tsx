import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import {
  BookOpen,
  Target,
  Trophy,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";

interface AppLayoutProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  actions?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", icon: Sparkles, path: "/dashboard" },
  { label: "Subjects", icon: BookOpen, path: "/subjects" },
  { label: "Daily Challenge", icon: Target, path: "/daily-challenges" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Achievements", icon: Trophy, path: "/achievements" },
];

export function AppLayout({
  title,
  description,
  loading,
  error,
  actions,
  children,
}: AppLayoutProps) {
  const { user, logout, isPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<"default" | "warm">("default");

  const displayName =
    (user as any)?.firstName ||
    (user as any)?.first_name ||
    (user as any)?.email ||
    "Learner";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

  const isLoading = isPending || loading;
  const isWarm = theme === "warm";

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "warm" || stored === "default") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "warm" ? "default" : "warm"));
  };

  const containerClasses = "min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface text-slate-50";

  return (
    <div className={containerClasses}>
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60 mix-blend-screen">
        <div className="absolute -top-40 left-10 h-80 w-80 rounded-full bg-brand-soft/25 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-96 w-96 rounded-full bg-brand-accent/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-6 lg:px-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 md:block">
          <GlassCard className="h-full p-4 text-slate-50" hover={false}>
            {/* Brand */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-brand-accent shadow-card">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  NateWise
                </p>
                <p className="text-xs text-slate-400">
                  NATED Study Companion
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    "hover:bg-white/10",
                    isActive(item.path)
                      ? "bg-white/15 text-white"
                      : "text-slate-300",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User section */}
            <div className="mt-8 border-t border-white/10 pt-4">
              <p className="text-xs mb-1 text-slate-400">
                Signed in as
              </p>
              <p className="text-sm font-medium truncate text-slate-50">
                {displayName}
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                className="mt-3 text-[11px] px-3 py-1"
                onClick={handleLogout}
              >
                Sign out
              </GlassButton>
            </div>
          </GlassCard>
        </aside>

        {/* Main content */}
        <main className="flex-1 pb-10">
          {/* Topbar (mobile brand + user) */}
            <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-brand-accent shadow-card">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p
                    className={
                      "text-xs font-semibold uppercase tracking-widest " +
                      "text-slate-300"
                    }
                  >
                    NateWise
                  </p>
                  <p
                    className={
                      "text-[11px] text-slate-400"
                    }
                  >
                    Hello, {displayName}
                  </p>
                </div>
              </div>
          </div>

          {/* Page header */}
          {(title || description || actions) && (
            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {title && (
                  <h1
                    className={
                      "text-2xl font-semibold tracking-tight sm:text-3xl " +
                      (isWarm ? "text-slate-900" : "text-slate-50")
                    }
                  >
                    {title}
                  </h1>
                )}
                {description && (
                  <p
                    className={
                      "mt-1 max-w-2xl text-sm " +
                      (isWarm ? "text-slate-700" : "text-slate-300")
                    }
                  >
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          )}

          {/* Loading / error / content */}
          {isLoading ? (
            <LoadingSpinner
              fullScreen
              message="Loading your workspace..."
            />
          ) : error ? (
            <div className="mt-4">
              <GlassCard className="border border-red-500/50 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-200">
                  Something went wrong
                </p>
                <p className="mt-1 text-xs text-red-200/80">{error}</p>
              </GlassCard>
            </div>
          ) : (
            <div className="mt-4">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
