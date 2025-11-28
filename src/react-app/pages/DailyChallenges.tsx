import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Trophy,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */

interface ChallengeBase {
  id: number;
  skill_id: number;
  skill_name: string;
  subject_name: string;
  questions_required: number;
  accuracy_required: number;
  xp_reward: number;
  challenge_date: string; // e.g. "2025-11-28"
}

interface ChallengeProgress {
  questions_completed: number;
  questions_correct: number;
  is_completed: boolean;
  completed_at: string | null;
}

type ChallengeWithProgress = ChallengeBase & ChallengeProgress;

interface ChallengeStats {
  total_completed: number;
  current_streak: number;
}

/* ----------------------------------------------------------
   API helpers
---------------------------------------------------------- */

// Soft: never throws. Returns null when anything goes wrong.
async function fetchTodayChallenge(): Promise<ChallengeWithProgress | null> {
  try {
    const res = await fetch("/api/daily-challenges/today");

    if (res.status === 404) {
      // No challenge for today
      return null;
    }

    if (!res.ok) {
      console.warn(
        "fetchTodayChallenge: non-OK status, treating as no challenge:",
        res.status
      );
      return null;
    }

    const data = await res.json();
    return data as ChallengeWithProgress;
  } catch (err) {
    console.warn("fetchTodayChallenge failed, treating as no challenge:", err);
    return null;
  }
}

// Already soft: returns [] if anything fails.
async function fetchChallengeHistory(
  limit = 10
): Promise<ChallengeWithProgress[]> {
  try {
    const res = await fetch(`/api/daily-challenges/history?limit=${limit}`);
    if (!res.ok) {
      console.warn(
        "fetchChallengeHistory: non-OK, treating as empty history:",
        res.status
      );
      return [];
    }
    const data = await res.json();
    return data as ChallengeWithProgress[];
  } catch (err) {
    console.warn("fetchChallengeHistory failed, treating as empty:", err);
    return [];
  }
}

// Soft: returns default stats if anything fails.
async function fetchChallengeStats(): Promise<ChallengeStats> {
  try {
    const res = await fetch("/api/daily-challenges/stats");
    if (!res.ok) {
      console.warn(
        "fetchChallengeStats: non-OK, using default stats:",
        res.status
      );
      return { total_completed: 0, current_streak: 0 };
    }
    const data = await res.json();
    return data as ChallengeStats;
  } catch (err) {
    console.warn("fetchChallengeStats failed, using default stats:", err);
    return { total_completed: 0, current_streak: 0 };
  }
}

async function claimChallengeXp(challengeId: number): Promise<void> {
  const res = await fetch(`/api/daily-challenges/${challengeId}/claim-xp`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      body || `Failed to claim XP (status ${res.status.toString()})`
    );
  }
}

/* ----------------------------------------------------------
   Component
---------------------------------------------------------- */

export default function DailyChallenges() {
  const navigate = useNavigate();

  const [todayChallenge, setTodayChallenge] =
    useState<ChallengeWithProgress | null>(null);
  const [history, setHistory] = useState<ChallengeWithProgress[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // None of these throw anymore
      const [today, hist, s] = await Promise.all([
        fetchTodayChallenge(),
        fetchChallengeHistory(10),
        fetchChallengeStats(),
      ]);

      setTodayChallenge(today);
      setHistory(hist);
      setStats(s);
      setLoading(false);
    };

    void load();
  }, []);

  const handleStartPractice = () => {
    if (!todayChallenge) return;
    navigate(`/skills/${todayChallenge.skill_id}/practice`, {
      state: {
        skillName: todayChallenge.skill_name,
        subjectName: todayChallenge.subject_name,
      },
    });
  };

  const handleClaimXp = async () => {
    if (!todayChallenge) return;
    try {
      setClaiming(true);
      setError(null);
      await claimChallengeXp(todayChallenge.id);
      setTodayChallenge({ ...todayChallenge, is_completed: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "We couldn't claim your XP. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  const todayAccuracy =
    todayChallenge && todayChallenge.questions_completed > 0
      ? (todayChallenge.questions_correct /
          todayChallenge.questions_completed) *
        100
      : 0;

  const targetMet =
    !!todayChallenge &&
    todayChallenge.questions_completed >=
      todayChallenge.questions_required &&
    todayAccuracy >= todayChallenge.accuracy_required;

  return (
    <AppLayout
      title="Daily Challenge"
      description="A focused challenge each day to keep your streak alive and earn bonus XP."
      loading={loading}
      error={error}
    >
      {!loading && (
        <div className="space-y-6">
          {/* Top stats row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Trophy className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                    Total Challenges Completed
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {stats?.total_completed ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    All-time daily challenges
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Zap className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                    Current Streak
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {stats?.current_streak ?? 0} days
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Complete today to keep it alive
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Clock className="h-5 w-5 text-sky-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                    Time suggestion
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    15–20 min
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Best done in one focused block
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
            {/* Today’s challenge */}
            <div className="space-y-4">
              <GlassCard className="p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/40">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                        Today&apos;s challenge
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                        {todayChallenge
                          ? todayChallenge.skill_name
                          : "No challenge assigned"}
                      </h2>
                      {todayChallenge && (
                        <p className="text-xs text-slate-300">
                          {todayChallenge.subject_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {todayChallenge && (
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{todayChallenge.challenge_date}</span>
                    </div>
                  )}
                </div>

                {todayChallenge ? (
                  <>
                    {/* Key stats */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <ChallengeStat
                        label="Questions"
                        value={`${todayChallenge.questions_completed}/${todayChallenge.questions_required}`}
                      />
                      <ChallengeStat
                        label="Accuracy target"
                        value={`${todayChallenge.accuracy_required}%`}
                      />
                      <ChallengeStat
                        label="Reward"
                        value={`${todayChallenge.xp_reward} XP`}
                      />
                    </div>

                    {/* Progress & status */}
                    <div className="mt-5 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span>Progress towards question goal</span>
                          <span>
                            {Math.min(
                              100,
                              Math.round(
                                (todayChallenge.questions_completed /
                                  todayChallenge.questions_required) *
                                  100
                              )
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-900/80">
                          <div
                            className="h-full bg-gradient-to-r from-brand-soft via-brand-accent to-amber-400 transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (todayChallenge.questions_completed /
                                    todayChallenge.questions_required) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-[11px] text-slate-300">
                          Accuracy so far:{" "}
                          <span className="font-semibold text-slate-50">
                            {todayAccuracy.toFixed(1)}%
                          </span>{" "}
                          · Target:{" "}
                          <span className="font-semibold">
                            {todayChallenge.accuracy_required}%
                          </span>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${
                            targetMet
                              ? "bg-emerald-400/15 text-emerald-200 border border-emerald-400/50"
                              : "bg-amber-400/15 text-amber-200 border border-amber-400/50"
                          }`}
                        >
                          {targetMet ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Target met</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Keep going</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate("/daily-challenges")}
                        >
                          View history
                        </GlassButton>
                        <GlassButton size="sm" onClick={handleStartPractice}>
                          Practice now
                          <ArrowRight className="h-4 w-4" />
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="primary"
                          disabled={
                            !targetMet ||
                            todayChallenge.is_completed ||
                            claiming
                          }
                          onClick={handleClaimXp}
                        >
                          {todayChallenge.is_completed
                            ? "XP claimed"
                            : claiming
                            ? "Claiming..."
                            : "Claim XP"}
                        </GlassButton>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-300">
                    There is no daily challenge assigned yet. Once your first
                    daily challenge is created on the backend, it will appear
                    here automatically.
                  </p>
                )}
              </GlassCard>
            </div>

            {/* History */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Recent challenges
              </h3>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <GlassCard className="p-4 text-sm text-slate-300">
                    You haven&apos;t completed any daily challenges yet. Start
                    today to begin your streak.
                  </GlassCard>
                ) : (
                  history.map((c) => (
                    <RecentChallengeCard key={c.id} challenge={c} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ----------------------------------------------------------
   Subcomponents
---------------------------------------------------------- */

function ChallengeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function RecentChallengeCard({ challenge }: { challenge: ChallengeWithProgress }) {
  const accuracy =
    challenge.questions_completed > 0
      ? Math.round(
          (challenge.questions_correct / challenge.questions_completed) * 100
        )
      : 0;

  const met =
    challenge.questions_completed >= challenge.questions_required &&
    accuracy >= challenge.accuracy_required;

  return (
    <GlassCard className="p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {met ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 text-amber-300" />
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-50">
              {challenge.skill_name}
            </h4>
            <p className="text-xs text-slate-400">
              {challenge.subject_name} • {challenge.challenge_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-300">
          <Zap className="h-3.5 w-3.5" />
          {challenge.xp_reward} XP
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>
          {challenge.questions_completed}/{challenge.questions_required} Q •{" "}
          {accuracy}% accuracy
        </span>
        <span className={met ? "text-emerald-300" : "text-amber-200"}>
          {met ? "Completed" : "Incomplete"}
        </span>
      </div>
    </GlassCard>
  );
}
