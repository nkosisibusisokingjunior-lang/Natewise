import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";
import { useAuth } from "@/react-app/auth/ApiAuth";

export default function Home() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate("/dashboard");
    }
  }, [isPending, navigate, user]);

  const handleSignIn = () => {
    navigate("/login");
  };

  if (isPending && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface text-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoadingSpinner fullScreen message="Checking your session..." />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-surface via-surface-subtle to-surface text-slate-50">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-70 mix-blend-screen">
        <div className="absolute -top-40 left-10 h-80 w-80 rounded-full bg-brand-soft/25 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-brand-accent shadow-card">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                NateWise
              </p>
              <p className="text-xs text-slate-400">NATED study companion</p>
            </div>
          </div>
          <GlassButton size="sm" onClick={() => void handleSignIn()}>
            Sign in
          </GlassButton>
        </header>

        {/* Hero */}
        <main className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Secure login
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Master NATED with adaptive practice, streaks, and SmartScore.
                </h1>
                <p className="text-sm text-slate-300 sm:text-base">
                  Sign in to unlock your NATED workspace, sync progress across
                  devices, and access adaptive practice, streaks, and SmartScore.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <GlassButton size="lg" onClick={() => void handleSignIn()}>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </GlassButton>
                <GlassButton
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/register")}
                  className="backdrop-blur"
                >
                  Create account
                </GlassButton>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatPill label="Subjects covered" value="9+" />
                <StatPill label="Questions in the bank" value="1000+" />
                <StatPill label="Live SmartScore" value="0-100" />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-3">
            <GlassCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Why learners stay
              </p>
              <div className="mt-4 space-y-3">
                <FeatureRow
                  icon={Target}
                  title="Adaptive practice"
                  description="Questions stay aligned to your level so you always know what to do next."
                />
                <FeatureRow
                  icon={TrendingUp}
                  title="SmartScore analytics"
                  description="Track SmartScore improvements per skill and subject with crystal-clear charts."
                />
                <FeatureRow
                  icon={Trophy}
                  title="Daily streaks and XP"
                  description="Earn XP from daily challenges and keep your streak alive with focused sets."
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                What you get
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniCard
                  icon={BookOpen}
                  title="Browse subjects"
                  description="Jump into N4-N6 subjects and drill the exact modules you need."
                />
                <MiniCard
                  icon={Zap}
                  title="Daily challenge"
                  description="Claim XP each day with a targeted set that protects your streak."
                />
                <MiniCard
                  icon={Sparkles}
                  title="Personalized sets"
                  description="Adaptive sessions keep difficulty balanced as your SmartScore climbs."
                />
                <MiniCard
                  icon={ShieldCheck}
                  title="Stay secure"
                  description="JWT-based auth keeps your account safe while you learn."
                />
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        <p className="text-xs text-slate-300">{description}</p>
      </div>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-soft to-brand-accent shadow-card">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        <p className="text-xs text-slate-300">{description}</p>
      </div>
    </div>
  );
}
