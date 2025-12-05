import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Target,
  TrendingUp,
  ChevronRight,
  Zap,
  Trophy,
  ArrowRight,
  Clock,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";
import api from "@/react-app/services/api";

interface DashboardStats {
  skills_practicing: number;
  skills_mastered: number;
  current_streak: number;
  total_badges: number;
}

interface RecentSkill {
  id: string;
  name: string;
  smart_score: number;
  subject_name: string;
  subject_color: string;
}

interface DailyChallenge {
  id: string;
  skill_id: string;
  skill_name: string;
  subject_name: string;
  questions_required: number;
  accuracy_required: number;
  xp_reward: number;
  questions_completed: number;
  questions_correct: number;
  challenge_date: string;
  error?: string;
  message?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSkills, setRecentSkills] = useState<RecentSkill[]>([]);
  const [dailyChallenge, setDailyChallenge] =
    useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, recentRes, challengeRes] = await Promise.all([
          api.get<DashboardStats>("/dashboard/stats"),
          api.get<RecentSkill[]>("/dashboard/recent-skills"),
          api.get<DailyChallenge>("/daily-challenges/today").catch((err) => {
            // If challenge is missing (404) or unauthorized, return null.
            if (err?.response?.status === 404) return null;
            throw err;
          }),
        ]);

        const statsData = statsRes.data;
        const recentData = recentRes.data;
        const challengeData =
          challengeRes && !challengeRes.data?.error && !challengeRes.data?.message
            ? (challengeRes.data as DailyChallenge)
            : null;

        setStats(statsData);
        setRecentSkills(recentData);
        setDailyChallenge(challengeData);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message || "We couldn't load your dashboard right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleGoToSubjects = () => navigate("/subjects");
  const handleGoToAnalytics = () => navigate("/analytics");
  const handleGoToAchievements = () => navigate("/achievements");

  const handleStartChallenge = () => {
    if (!dailyChallenge) return;
    navigate(`/skills/${dailyChallenge.skill_id}/practice`);
  };

  return (
    <AppLayout
      title="Learning Dashboard"
      description="Welcome back! Continue your NATED journey with focused practice, daily challenges, and clear progress."
      loading={loading}
      error={error}
      actions={
        <GlassButton size="sm" variant="secondary" onClick={handleGoToSubjects}>
          Browse subjects
        </GlassButton>
      }
    >
      {loading && (
        <div className="mt-4">
          <LoadingSpinner fullScreen message="Preparing your dashboard..." />
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Top section: stats + daily challenge */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Quick stats + streak */}
            <div className="space-y-4">
              {/* Quick Stats */}
              {stats && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={BookOpen}
                    label="Skills practicing"
                    value={stats.skills_practicing.toString()}
                    helper="Keep building consistency"
                  />
                  <StatCard
                    icon={Target}
                    label="Skills mastered"
                    value={stats.skills_mastered.toString()}
                    helper="Aim for SmartScore 80+"
                  />
                  <StatCard
                    icon={Zap}
                    label="Current streak"
                    value={`${stats.current_streak} days`}
                    helper="Don't break the chain"
                  />
                  <StatCard
                    icon={Trophy}
                    label="Badges earned"
                    value={stats.total_badges.toString()}
                    helper="Check your achievements"
                    onClick={handleGoToAchievements}
                    clickable
                  />
                </div>
              )}

              {/* Recent skills */}
              <GlassCard className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Continue where you left off
                    </p>
                    <p className="text-[13px] text-slate-400">
                      Pick up one of your recent skills to keep the momentum.
                    </p>
                  </div>
                  <GlassButton
                    size="sm"
                    variant="secondary"
                    className="hidden sm:inline-flex"
                    onClick={handleGoToAnalytics}
                  >
                    View full analytics
                    <TrendingUp className="h-4 w-4" />
                  </GlassButton>
                </div>

                {recentSkills.length === 0 ? (
                  <p className="py-4 text-sm text-slate-400">
                    You haven't practiced any skills yet. Start by choosing a
                    subject.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {recentSkills.map((skill) => (
                      <RecentSkillCard
                        key={skill.id}
                        skill={skill}
                        onPractice={() =>
                          navigate(`/skills/${skill.id}/practice`)
                        }
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Daily challenge panel */}
            <GlassCard className="p-5 lg:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                    <Zap className="h-3.5 w-3.5" />
                    Daily Challenge
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-50">
                    {dailyChallenge
                      ? dailyChallenge.skill_name
                      : "No challenge yet"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Complete today's focused challenge to keep your streak
                    alive and earn extra XP.
                  </p>
                </div>
              </div>

              {dailyChallenge ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <DailyDetail
                      label="Questions"
                      value={`${dailyChallenge.questions_completed}/${dailyChallenge.questions_required}`}
                    />
                    <DailyDetail
                      label="Accuracy target"
                      value={`${dailyChallenge.accuracy_required}%`}
                    />
                    <DailyDetail
                      label="Reward"
                      value={`${dailyChallenge.xp_reward} XP`}
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    {/* progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Progress towards target</span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              (dailyChallenge.questions_completed /
                                dailyChallenge.questions_required) *
                                100
                            )
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                        <div
                          className="h-full bg-gradient-to-r from-brand-soft via-brand-accent to-amber-400 transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (dailyChallenge.questions_completed /
                                  dailyChallenge.questions_required) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Best done in one focused 15-20 minute session.</span>
                      </div>
                      <div className="flex gap-2">
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate("/daily-challenges")}
                        >
                          View all challenges
                        </GlassButton>
                        <GlassButton size="sm" onClick={handleStartChallenge}>
                          Start now
                          <ArrowRight className="h-4 w-4" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm text-slate-400">
                  There's no daily challenge yet. Try practicing a skill from
                  your subjects to generate targeted practice.
                </div>
              )}
            </GlassCard>
          </div>

          {/* Bottom section - small promo / CTA row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Analytics
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  See which skills need your attention most.
                </p>
              </div>
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={handleGoToAnalytics}
              >
                Open
                <ChevronRight className="h-4 w-4" />
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Achievements
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Unlock badges as you master more skills.
                </p>
              </div>
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={handleGoToAchievements}
              >
                View
                <Trophy className="h-4 w-4" />
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Subjects
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Explore the full list of NATED subjects and modules.
                </p>
              </div>
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={handleGoToSubjects}
              >
                Browse
                <BookOpen className="h-4 w-4" />
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ------------------------------------------------------------------
 * UI Subcomponents
 * ------------------------------------------------------------------*/

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper?: string;
  onClick?: () => void;
  clickable?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  onClick,
  clickable,
}: StatCardProps) {
  return (
    <GlassCard
      className={
        "p-4 flex flex-col justify-between h-full cursor-default" +
        (clickable ? " cursor-pointer" : "")
      }
      hover={clickable}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-5 w-5 text-white" />
        </div>
        {clickable && onClick && (
          <button
            onClick={onClick}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-white"
          >
            View
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          {label}
        </div>
        <div className="mt-1 text-xl font-semibold text-white">{value}</div>
        {helper && (
          <div className="mt-1 text-[11px] text-slate-400">{helper}</div>
        )}
      </div>
    </GlassCard>
  );
}

function RecentSkillCard({
  skill,
  onPractice,
}: {
  skill: RecentSkill;
  onPractice: () => void;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            {skill.subject_name}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            {skill.name}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              SmartScore
            </p>
            <p className="mt-0.5 text-lg font-semibold text-white">
              {skill.smart_score}
            </p>
          </div>
          <div className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/80">
              <div
                className={`h-full bg-gradient-to-r ${skill.subject_color}`}
                style={{ width: `${Math.min(skill.smart_score, 100)}%` }}
              />
            </div>
          </div>
          <GlassButton size="sm" onClick={onPractice}>
            Practice
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}

function DailyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}
