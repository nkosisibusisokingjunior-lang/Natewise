import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Lock,
  ArrowRight,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import api from "@/react-app/services/api";

interface Achievement {
  id: number;
  name: string;
  description: string;
  badge_icon_url: string | null;
  achievement_type: string;
  points_value: number;
  is_earned: boolean;
  earned_at: string | null;
  progress?: number;
  total?: number;
}

interface UserLevel {
  current_level: number;
  current_xp: number;
  xp_for_next_level: number;
  total_achievements: number;
  earned_achievements: number;
}

const fetchAchievements = async (): Promise<Achievement[]> => {
  const res = await api.get<Achievement[]>("/achievements");
  return res.data;
};

const fetchLevel = async (): Promise<UserLevel> => {
  const res = await api.get<UserLevel>("/achievements/level");
  return res.data;
};

export default function Achievements() {
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [levelInfo, setLevelInfo] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ach, lvl] = await Promise.all([
          fetchAchievements(),
          fetchLevel(),
        ]);
        setAchievements(ach);
        setLevelInfo(lvl);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message || "We couldn't load your achievements right now."
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const { earned, locked } = useMemo(() => {
    const earnedList = achievements.filter((a) => a.is_earned);
    const lockedList = achievements.filter((a) => !a.is_earned);
    return { earned: earnedList, locked: lockedList };
  }, [achievements]);

  return (
    <AppLayout
      title="Achievements"
      description="Track your badges, XP, and progress milestones."
      loading={loading}
      error={error}
      actions={
        <div className="flex gap-2">
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </GlassButton>
          <GlassButton size="sm" onClick={() => navigate("/subjects")}>
            Start practicing
          </GlassButton>
        </div>
      }
    >
      {!loading && (
        <div className="space-y-6">
          {/* Level summary */}
          {levelInfo && (
            <GlassCard className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Current level
                  </p>
                  <h1 className="text-2xl font-semibold text-white">
                    Level {levelInfo.current_level}
                  </h1>
                  <p className="text-sm text-slate-200">
                    {levelInfo.current_xp} / {levelInfo.xp_for_next_level} XP to
                    next level
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-900/70">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (levelInfo.current_xp / levelInfo.xp_for_next_level) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center text-sm text-slate-200">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-xs text-slate-300">Total XP</p>
                  <p className="text-lg font-semibold text-white">
                    {levelInfo.current_xp}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-xs text-slate-300">Achievements</p>
                  <p className="text-lg font-semibold text-white">
                    {levelInfo.earned_achievements} /{" "}
                    {levelInfo.total_achievements}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-xs text-slate-300">Earned</p>
                  <p className="text-lg font-semibold text-white">
                    {earned.length}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-xs text-slate-300">Locked</p>
                  <p className="text-lg font-semibold text-white">
                    {locked.length}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Earned achievements */}
          {earned.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Unlocked achievements
                </h2>
                <div className="text-xs text-slate-300">{earned.length} earned</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {earned.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Locked achievements */}
          {locked.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Locked achievements
                </h2>
                <div className="text-xs text-slate-300">
                  {locked.length} to unlock
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {locked.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isEarned = achievement.is_earned;
  const iconMap: Record<string, any> = {
    first_question: Target,
    correct_answers: Zap,
    streak: TrendingUp,
    daily_streak: Star,
    session_questions: Award,
    skills_mastered: Trophy,
    subject_mastery: Award,
    level: Star,
    daily_challenge: Target,
  };
  const Icon = iconMap[achievement.achievement_type] || Award;

  return (
    <GlassCard
      className={`p-5 transition-all ${
        isEarned ? "border-amber-300/50 bg-amber-400/10" : "border-white/10 bg-white/5"
      }`}
    >
      {!isEarned && (
        <div className="mb-2 flex items-center gap-1 text-xs text-slate-400">
          <Lock className="h-4 w-4" />
          Locked
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isEarned ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-white/10"
          }`}
        >
          <Icon className={isEarned ? "h-6 w-6 text-white" : "h-6 w-6 text-slate-300"} />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className={`text-base font-semibold ${isEarned ? "text-white" : "text-slate-200"}`}>
            {achievement.name}
          </h3>
          <p className="text-sm text-slate-300">{achievement.description}</p>
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <Zap className="h-3.5 w-3.5" />
            {achievement.points_value} XP
          </div>
          {isEarned && achievement.earned_at && (
            <p className="text-[11px] text-slate-400">
              Earned {new Date(achievement.earned_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {!isEarned && achievement.progress !== undefined && achievement.total !== undefined && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Progress</span>
            <span>
              {achievement.progress}/{achievement.total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-900/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-500 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((achievement.progress / achievement.total) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </GlassCard>
  );
}
