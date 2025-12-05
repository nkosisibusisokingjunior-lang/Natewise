import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart,
  BookOpen,
  Calendar,
  Clock,
  PieChart,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import api from "@/react-app/services/api";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface SummaryStats {
  total_questions: number;
  total_time: {
    hours: number;
    minutes: number;
    display: string;
  };
  skills_practiced: number;
  skills_mastered: number;
  skills_proficient: number;
}

interface SubjectBreakdown {
  subject_name: string;
  skills_practiced: number;
  skills_mastered: number;
  skills_proficient: number;
  average_score: number;
  questions_attempted: number;
  time_spent_seconds: number;
}

interface RecentSkill {
  skill_name: string;
  subject_name: string;
  smart_score: number;
  is_mastered: boolean;
  last_practiced_at: string;
  questions_attempted: number;
  questions_correct: number;
}

interface WeakSkill {
  skill_name: string;
  subject_name: string;
  smart_score: number;
  questions_attempted: number;
  questions_correct: number;
  questions_missed: number;
  last_practiced_at: string;
}

interface DailyTime {
  practice_date: string;
  total_seconds: number;
  skills_practiced: number;
  questions_attempted: number;
}

// ------------------------------------------------------------
// API helpers
// ------------------------------------------------------------

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await api.get<T>(url);
  return res.data;
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function Analytics() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>(
    []
  );
  const [recentSkills, setRecentSkills] = useState<RecentSkill[]>([]);
  const [weakSkills, setWeakSkills] = useState<WeakSkill[]>([]);
  const [dailyTime, setDailyTime] = useState<DailyTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, subjectData, recentData, weakData, dailyData] =
          await Promise.all([
            fetchJson<SummaryStats>("/api/v1/analytics/summary"),
            fetchJson<SubjectBreakdown[]>("/api/v1/analytics/subject-breakdown"),
            fetchJson<RecentSkill[]>("/api/v1/analytics/recent-skills?limit=10"),
            fetchJson<WeakSkill[]>(
              "/api/v1/analytics/weak-skills-detailed?limit=10"
            ),
            fetchJson<DailyTime[]>("/api/v1/analytics/daily-time?days=30"),
          ]);

        setSummary(summaryData);
        setSubjectBreakdown(subjectData);
        setRecentSkills(recentData);
        setWeakSkills(weakData);
        setDailyTime(dailyData);
      } catch (err: any) {
        console.error("Failed to load analytics data:", err);
        setError(err?.message || "Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const totalPracticeMinutes = useMemo(() => {
    if (!summary) return 0;
    return summary.total_time.hours * 60 + summary.total_time.minutes;
  }, [summary]);

  return (
    <AppLayout
      title="Learning Analytics"
      description="Progress overview, skill health, and recent practice."
      loading={loading || isPending}
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
            Browse subjects
          </GlassButton>
        </div>
      }
    >
      {!loading && !error && summary && (
        <div className="space-y-6">
          {/* Header */}
          <GlassCard className="p-5 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                <BarChart className="h-3.5 w-3.5" />
                Summary report
              </div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">
                {user?.google_user_data?.given_name || "Student"}'s analytics
              </h1>
              <p className="text-sm text-slate-300">
                Snapshot of your recent practice, mastery, and areas to focus.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <User className="h-4 w-4" />
              <span>{user?.email || "dev-user"}</span>
            </div>
          </GlassCard>

          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={Zap}
              label="Questions answered"
              value={summary.total_questions.toLocaleString()}
              helper="Across all practice sessions"
            />
            <SummaryCard
              icon={Clock}
              label="Time learning"
              value={summary.total_time.display}
              helper={`${totalPracticeMinutes} minutes total`}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Skills practiced"
              value={summary.skills_practiced.toLocaleString()}
              helper="With recorded progress"
            />
            <SummaryCard
              icon={Award}
              label="Skills mastered"
              value={summary.skills_mastered.toLocaleString()}
              helper="At mastery threshold"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
            {/* Subjects */}
            <GlassCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Skills practiced by subject
                </h2>
                <div className="text-xs text-slate-300">
                  {subjectBreakdown.length} subjects
                </div>
              </div>
              <div className="grid gap-3">
                {subjectBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    No subject analytics yet. Practice a skill to see data here.
                  </p>
                ) : (
                  subjectBreakdown.map((subject) => (
                    <SubjectRow key={subject.subject_name} subject={subject} />
                  ))
                )}
              </div>
            </GlassCard>

            {/* Time spent */}
            <GlassCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Time spent practicing
                </h2>
                <Calendar className="h-4 w-4 text-slate-300" />
              </div>
              <DailyTimeChart data={dailyTime} />
            </GlassCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent skills */}
            <GlassCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Recently practiced skills
                </h2>
                <div className="text-xs text-slate-300">
                  {recentSkills.length} skills
                </div>
              </div>
              <div className="space-y-2">
                {recentSkills.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    No recent practice yet. Start a session to see activity.
                  </p>
                ) : (
                  recentSkills.map((skill, idx) => (
                    <SkillRow key={idx} skill={skill} />
                  ))
                )}
              </div>
            </GlassCard>

            {/* Weak skills */}
            <GlassCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Areas to focus
                </h2>
                <AlertTriangle className="h-4 w-4 text-amber-300" />
              </div>
              <div className="space-y-2">
                {weakSkills.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    Great job! We will highlight skills that need attention
                    once you practice.
                  </p>
                ) : (
                  weakSkills.map((skill, idx) => (
                    <WeakSkillRow key={idx} skill={skill} />
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
              <PieChart className="h-4 w-4" />
              Mastery progress
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <MasteryTile
                label="Mastered"
                count={summary.skills_mastered}
                total={summary.skills_practiced}
                color="from-emerald-400 to-emerald-600"
                helper="90%+ SmartScore"
              />
              <MasteryTile
                label="Proficient"
                count={summary.skills_proficient}
                total={summary.skills_practiced}
                color="from-sky-400 to-cyan-500"
                helper="80-89% SmartScore"
              />
              <MasteryTile
                label="Learning"
                count={
                  Math.max(
                    0,
                    summary.skills_practiced -
                      summary.skills_mastered -
                      summary.skills_proficient
                  )
                }
                total={summary.skills_practiced}
                color="from-amber-400 to-orange-500"
                helper="Still in progress"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-brand-accent flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">
                  Learning resources
                </h3>
                <p className="text-sm text-slate-200">
                  Video tutorials, step-by-step lessons, worked examples, and
                  detailed explanations are available whenever you need them.
                  Review explanations before moving on to the next question to
                  build a solid understanding.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}

// ------------------------------------------------------------
// Subcomponents
// ------------------------------------------------------------

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            {label}
          </p>
          <p className="text-lg font-semibold text-white">{value}</p>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function SubjectRow({ subject }: { subject: SubjectBreakdown }) {
  const totalSkills = subject.skills_practiced || 1;
  const masteredPercent = (subject.skills_mastered / totalSkills) * 100;
  const proficientPercent = (subject.skills_proficient / totalSkills) * 100;
  const learningPercent = Math.max(
    0,
    100 - masteredPercent - proficientPercent
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {subject.subject_name}
          </p>
          <p className="text-xs text-slate-300">
            {subject.skills_practiced} skills practiced
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            {Math.round(subject.average_score)}%
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Avg score
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>Mastery progress</span>
          <span>{subject.skills_mastered} mastered</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/70">
          <div
            className="h-full bg-emerald-400"
            style={{ width: `${masteredPercent}%` }}
          />
          <div
            className="relative -mt-2 h-2 bg-sky-400"
            style={{ width: `${masteredPercent + proficientPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-emerald-200">
            {subject.skills_mastered} mastered
          </span>
          <span className="text-sky-200">
            {subject.skills_proficient} proficient
          </span>
          <span className="text-amber-200">
            {Math.max(
              0,
              subject.skills_practiced -
                subject.skills_mastered -
                subject.skills_proficient
            )}{" "}
            learning
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-sm font-semibold text-white">
            {subject.questions_attempted}
          </div>
          <div>Questions</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-sm font-semibold text-white">
            {Math.round(subject.time_spent_seconds / 60)}m
          </div>
          <div>Time</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-sm font-semibold text-white">
            {Math.round(learningPercent)}%
          </div>
          <div>In progress</div>
        </div>
      </div>
    </div>
  );
}

function SkillRow({ skill }: { skill: RecentSkill }) {
  const badgeClass =
    skill.smart_score >= 90
      ? "bg-emerald-400/20 text-emerald-100"
      : skill.smart_score >= 70
      ? "bg-amber-400/20 text-amber-100"
      : "bg-rose-400/20 text-rose-100";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {skill.subject_name}
        </span>
        <span className="text-sm font-semibold text-white">
          {skill.skill_name}
        </span>
        <span className="text-[11px] text-slate-400">
          {new Date(skill.last_practiced_at).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {skill.is_mastered && (
          <Award className="h-4 w-4 text-amber-300" aria-label="Mastered" />
        )}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {skill.smart_score}%
        </span>
      </div>
    </div>
  );
}

function WeakSkillRow({ skill }: { skill: WeakSkill }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {skill.subject_name}
        </span>
        <span className="text-sm font-semibold text-white">
          {skill.skill_name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-rose-400/15 px-2 py-1 text-rose-100">
          Missed {skill.questions_missed}
        </span>
        <span className="rounded-full bg-amber-400/15 px-2 py-1 text-amber-100">
          {skill.smart_score}%
        </span>
      </div>
    </div>
  );
}

function DailyTimeChart({ data }: { data: DailyTime[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-sm text-slate-300 py-6">
        <div className="flex items-center justify-center gap-2 text-slate-200">
          <Activity className="h-4 w-4" />
          No practice data yet
        </div>
      </div>
    );
  }

  const trimmed = data.slice(-14);
  const maxSeconds = Math.max(...trimmed.map((d) => d.total_seconds), 1);

  return (
    <div className="space-y-3">
      {trimmed.map((day) => (
        <div key={day.practice_date} className="flex items-center gap-3">
          <div className="w-16 text-[11px] text-slate-400">
            {new Date(day.practice_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex-1 h-2 rounded-full bg-slate-900/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-soft to-brand-accent"
              style={{
                width: `${Math.max(
                  4,
                  Math.round((day.total_seconds / maxSeconds) * 100)
                )}%`,
              }}
            />
          </div>
          <div className="w-12 text-right text-[11px] text-slate-300">
            {Math.round(day.total_seconds / 60)}m
          </div>
        </div>
      ))}
    </div>
  );
}

function MasteryTile({
  label,
  count,
  total,
  color,
  helper,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  helper: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center space-y-1">
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${color}`}
      >
        <span className="text-sm font-semibold text-white">{percentage}%</span>
      </div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-lg font-semibold text-white">{count}</p>
      <p className="text-xs text-slate-300">{helper}</p>
    </div>
  );
}
