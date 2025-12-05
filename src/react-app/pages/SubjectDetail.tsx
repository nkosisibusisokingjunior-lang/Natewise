import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Puzzle,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subject {
  id: string;
  name: string;
  code: string;
  nated_level: string;
  description: string;
  color_hex?: string | null;
  modules?: Module[];
}

interface Module {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  display_order: number;
  topics?: Topic[];
}

interface Topic {
  id: string;
  module_id: string;
  name: string;
  description: string;
  display_order: number;
  skills?: Skill[];
}

interface Skill {
  id: string;
  topic_id: string;
  name: string;
  description: string;
  difficulty_level: number;
  display_order: number;
  mastery_threshold: number;
  smart_score?: number;
  is_mastered?: boolean;
  questions_attempted?: number;
  questions_correct?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubjectDetail() {
  const { isPending } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const subjectId = id || "";

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/subjects/${subjectId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch subject: ${response.status.toString()}`);
        }

        const subjectData = await response.json();

        // Enrich modules with topics/skills
        const modulesWithTopics: Module[] = await Promise.all(
          (subjectData.modules || []).map(async (mod: Module) => {
            try {
              const topicsRes = await fetch(`/api/v1/topics?moduleId=${mod.id}`);
              const topicsData = await topicsRes.json();

              const topicsWithSkills: Topic[] = await Promise.all(
                (topicsData || []).map(async (topic: Topic) => {
                  try {
                    const skillsRes = await fetch(`/api/v1/skills?topicId=${topic.id}`);
                    const skillsData = await skillsRes.json();

                    const skillsWithProgress: Skill[] = await Promise.all(
                      (skillsData || []).map(async (skill: Skill) => {
                        try {
                          const skillRes = await fetch(`/api/v1/skills/${skill.id}`);
                          if (skillRes.ok) {
                            const skillDetail = await skillRes.json();
                            return { ...skill, ...skillDetail };
                          }
                          return skill;
                        } catch {
                          return skill;
                        }
                      })
                    );

                    return { ...topic, skills: skillsWithProgress };
                  } catch (err) {
                    console.error("Failed to load skills for topic", topic.id, err);
                    return { ...topic, skills: [] };
                  }
                })
              );

              return { ...mod, topics: topicsWithSkills };
            } catch (err) {
              console.error("Failed to load topics for module", mod.id, err);
              return { ...mod, topics: [] };
            }
          })
        );

        setSubject({ ...subjectData, modules: modulesWithTopics });
      } catch (err: any) {
        console.error("Error fetching subject:", err);
        setError(err?.message || "Failed to load subject");
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      void fetchSubjectData();
    } else {
      setLoading(false);
      setError("Invalid subject id");
    }
  }, [subjectId]);

  const stats = useMemo(() => {
    if (!subject?.modules) {
      return {
        totalTopics: 0,
        totalSkills: 0,
        overallSmartScore: 0,
        masteredSkills: 0,
        totalPracticeTime: 0,
      };
    }

    let totalTopics = 0;
    let totalSkills = 0;
    let totalSmartScore = 0;
    let skillsWithProgress = 0;
    let masteredSkills = 0;
    let totalPracticeTime = 0;

    subject.modules.forEach((module) => {
      module.topics?.forEach((topic) => {
        totalTopics += 1;
        topic.skills?.forEach((skill) => {
          totalSkills += 1;
          if (typeof skill.smart_score === "number") {
            totalSmartScore += skill.smart_score;
            skillsWithProgress += 1;
          }
          if (skill.is_mastered) {
            masteredSkills += 1;
          }
          totalPracticeTime += (skill.questions_attempted || 0) * 2;
        });
      });
    });

    const overallSmartScore =
      skillsWithProgress > 0 ? Math.round(totalSmartScore / skillsWithProgress) : 0;

    return {
      totalTopics,
      totalSkills,
      overallSmartScore,
      masteredSkills,
      totalPracticeTime: Math.round(totalPracticeTime / 60),
    };
  }, [subject]);

  const handlePracticeSkill = (skillId: string, skillName: string) => {
    navigate(`/skills/${skillId}/practice`, {
      state: { skillName, subjectName: subject?.name },
    });
  };

  const progressPercent =
    stats.totalSkills > 0
      ? Math.min(100, Math.round((stats.masteredSkills / stats.totalSkills) * 100))
      : 0;

  const overallTitle = subject ? subject.name : "Subject";
  const overallDescription = subject
    ? `${subject.code} - Level ${subject.nated_level}`
    : "Subject overview";

  return (
    <AppLayout
      title={overallTitle}
      description={overallDescription}
      loading={loading || isPending}
      error={error}
      actions={
        <GlassButton
          size="sm"
          variant="secondary"
          onClick={() => navigate("/subjects")}
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subjects
        </GlassButton>
      }
    >
      {!loading && !error && !subject && (
        <GlassCard className="p-6 text-center text-sm text-slate-300">
          The requested subject could not be found.
        </GlassCard>
      )}

      {!loading && !error && subject && (
        <div className="space-y-6">
          {/* Hero */}
          <GlassCard className="relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-soft/20 via-transparent to-brand-accent/10" />
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  <BookOpen className="h-3.5 w-3.5" />
                  NATED {subject.nated_level}
                </div>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  {subject.name}
                </h1>
                <p className="text-sm text-slate-200">
                  {subject.code} - Level {subject.nated_level}
                </p>
                <p className="max-w-3xl text-sm text-slate-200/80 sm:text-base">
                  {subject.description}
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"
                  style={{ backgroundColor: subject.color_hex || undefined }}
                >
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Modules */}
            <div className="space-y-4">
              {subject.modules && subject.modules.length > 0 ? (
                subject.modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onPracticeSkill={handlePracticeSkill}
                  />
                ))
              ) : (
                <GlassCard className="p-5 text-sm text-slate-300">
                  No modules are available for this subject yet. Check back soon.
                </GlassCard>
              )}
            </div>

            {/* Sidebar */}
            <GlassCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                <Target className="h-4 w-4" />
                Learning progress
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  icon={Puzzle}
                  label="Modules"
                  value={subject.modules?.length || 0}
                />
                <StatTile icon={Target} label="Topics" value={stats.totalTopics} />
                <StatTile
                  icon={TrendingUp}
                  label="Skills"
                  value={stats.totalSkills}
                />
                <StatTile
                  icon={Award}
                  label="Mastered"
                  value={`${stats.masteredSkills}/${stats.totalSkills || 0}`}
                />
                <StatTile
                  icon={Zap}
                  label="SmartScore"
                  value={`${stats.overallSmartScore}/100`}
                />
                <StatTile
                  icon={Clock}
                  label="Practice time"
                  value={`${stats.totalPracticeTime} min`}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Overall progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900/80">
                  <div
                    className="h-full bg-gradient-to-r from-brand-soft via-brand-accent to-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {stats.totalSkills > 0 && (
                <GlassButton
                  size="md"
                  onClick={() => {
                    const firstSkill = subject.modules
                      ?.flatMap((m) => m.topics || [])
                      .flatMap((t) => t.skills || [])
                      .find((s) => s.id);
                    if (firstSkill) {
                      handlePracticeSkill(firstSkill.id, firstSkill.name);
                    }
                  }}
                  className="w-full justify-center"
                >
                  <Play className="h-4 w-4" />
                  Start quick practice
                </GlassButton>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function ModuleCard({
  module,
  onPracticeSkill,
}: {
  module: Module;
  onPracticeSkill: (skillId: string, skillName: string) => void;
}) {
  const allSkills = module.topics?.flatMap((t) => t.skills || []) || [];
  const masteredSkills = allSkills.filter((s) => s.is_mastered).length;
  const avgSmartScore =
    allSkills.length > 0
      ? Math.round(
          allSkills.reduce((sum, skill) => sum + (skill.smart_score || 0), 0) /
            allSkills.length
        )
      : 0;

  return (
    <GlassCard className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            <Puzzle className="h-4 w-4" />
            Module {module.display_order}
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {module.name}
          </h3>
          <p className="text-sm text-slate-300">{module.description}</p>
        </div>
        <div className="flex flex-none items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-sm font-semibold text-white">{avgSmartScore}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-300">
            Avg score
          </div>
          <div className="text-[11px] text-emerald-200">
            {masteredSkills}/{allSkills.length || 0} mastered
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {module.topics && module.topics.length > 0 ? (
          module.topics.map((topic) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              onPracticeSkill={onPracticeSkill}
            />
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No topics available for this module yet.
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function TopicSection({
  topic,
  onPracticeSkill,
}: {
  topic: Topic;
  onPracticeSkill: (skillId: string, skillName: string) => void;
}) {
  const skills = topic.skills || [];
  const topicAvgScore =
    skills.length > 0
      ? Math.round(
          skills.reduce((sum, skill) => sum + (skill.smart_score || 0), 0) /
            skills.length
        )
      : 0;
  const masteredSkills = skills.filter((skill) => skill.is_mastered).length;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-white">{topic.name}</h4>
          <p className="text-xs text-slate-300">{topic.description}</p>
        </div>
        <div className="flex flex-none items-center gap-3 text-xs text-slate-300">
          <span className="rounded-full bg-white/5 px-3 py-1">
            Avg: {topicAvgScore}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1">
            {masteredSkills}/{skills.length || 0} mastered
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {skills.map((skill) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => onPracticeSkill(skill.id, skill.name)}
            className={`w-full rounded-lg border px-3 py-3 text-left transition ${
              skill.is_mastered
                ? "border-emerald-400/50 bg-emerald-400/10 hover:border-emerald-400/70"
                : "border-white/10 bg-white/5 hover:border-brand-accent/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {skill.name}
                  </span>
                  {skill.is_mastered && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mastered
                    </span>
                  )}
                </div>
                {skill.description && (
                  <p className="text-xs text-slate-300">{skill.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span>Difficulty: {skill.difficulty_level}/5</span>
                  <span>
                    Mastery target: {skill.mastery_threshold}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold ${
                    (skill.smart_score || 0) >= 80
                      ? "text-emerald-300"
                      : (skill.smart_score || 0) >= 60
                      ? "text-amber-200"
                      : "text-rose-200"
                  }`}
                >
                  {skill.smart_score ?? 0}
                </div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                  SmartScore
                </div>
              </div>
            </div>
          </button>
        ))}

        {skills.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            No skills available for this topic yet.
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <GlassButton
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={() => {
            const firstSkill = skills[0];
            if (firstSkill) {
              onPracticeSkill(firstSkill.id, `${topic.name} - ${firstSkill.name}`);
            }
          }}
        >
          <Play className="h-4 w-4" />
          Practice {topic.name}
        </GlassButton>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
