import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Award,
  Target,
  TrendingUp,
  Clock,
  Star,
  Trophy,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";

// ----------------------------------------------------
// Types
// ----------------------------------------------------

interface Question {
  id: number;
  skill_id: number;
  question_type: string;
  question_text: string;
  question_data: string; // JSON: { options: string[] } etc.
  correct_answer: string;
  explanation: string;
  difficulty_rating: number;
  points_value: number;
}

interface Skill {
  id: number;
  topic_id: number;
  name: string;
  description?: string;
  difficulty_level: number;
  mastery_threshold: number;
  smart_score?: number;
  is_mastered?: boolean;
  questions_attempted?: number;
  questions_correct?: number;
}

interface Progress {
  smart_score: number;
  questions_attempted: number;
  questions_correct: number;
  current_streak: number;
  is_mastered: boolean;
}

interface AdaptiveSession {
  questions: Question[];
  current_difficulty: number;
  current_smart_score: number;
  next_difficulty_threshold: number;
}

const DIFFICULTY_LEVELS: Record<
  number,
  { name: string; color: string; description: string }
> = {
  1: {
    name: "Foundation",
    color: "from-emerald-400 to-emerald-600",
    description: "Basic concepts and warm-up",
  },
  2: {
    name: "Developing",
    color: "from-sky-400 to-cyan-500",
    description: "Building understanding",
  },
  3: {
    name: "Proficient",
    color: "from-amber-400 to-orange-500",
    description: "Confident problem solving",
  },
  4: {
    name: "Advanced",
    color: "from-orange-500 to-rose-500",
    description: "Challenging applications",
  },
  5: {
    name: "Master",
    color: "from-purple-500 to-pink-500",
    description: "Exam-level mastery",
  },
};

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ----------------------------------------------------
// Component
// ----------------------------------------------------

export default function SkillPractice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const skillId = Number(id || 0);

  // Core state
  const [skill, setSkill] = useState<Skill | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adaptive session / stats
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [masteryProgress, setMasteryProgress] = useState(0);

  // UI state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // ----------------------------------------------------
  // Init adaptive session
  // ----------------------------------------------------

  useEffect(() => {
    if (!skillId) {
      setError("Invalid skill.");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch skill details
        const skillResponse = await fetch(`/api/skills/${skillId}`);
        if (!skillResponse.ok) throw new Error("Failed to fetch skill");
        const skillData: Skill = await skillResponse.json();

        // 2. Fetch adaptive questions
        const adaptiveResponse = await fetch(
          `/api/skills/${skillId}/adaptive-questions`
        );
        if (!adaptiveResponse.ok) {
          throw new Error("Failed to fetch adaptive questions");
        }
        const adaptiveData: AdaptiveSession = await adaptiveResponse.json();

        // 3. Fetch or initialise progress
        const progressResponse = await fetch(`/api/skills/${skillId}/progress`);
        let progressData: Progress;
        if (progressResponse.ok) {
          progressData = await progressResponse.json();
        } else {
          progressData = {
            smart_score: 0,
            questions_attempted: 0,
            questions_correct: 0,
            current_streak: 0,
            is_mastered: false,
          };
        }

        setSkill(skillData);
        setProgress(progressData);
        setCurrentDifficulty(adaptiveData.current_difficulty);

        if (adaptiveData.questions?.length > 0) {
          setCurrentQuestion(adaptiveData.questions[0]);
        } else {
          setCurrentQuestion(null);
        }
      } catch (err: any) {
        console.error("Error initializing adaptive session:", err);
        setError(
          err?.message || "Failed to load adaptive practice for this skill."
        );
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [skillId]);

  // ----------------------------------------------------
  // Derived values
  // ----------------------------------------------------

  const sessionAccuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  const questionData = currentQuestion?.question_data
    ? (() => {
        try {
          return JSON.parse(currentQuestion.question_data);
        } catch {
          return null;
        }
      })()
    : null;

  const rawOptions: string[] = questionData?.options || [];

  // Randomise the options per question
  const shuffledOptions: string[] = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(rawOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, questionData?.options?.length]);

  const difficultyInfo =
    DIFFICULTY_LEVELS[
      currentDifficulty as keyof typeof DIFFICULTY_LEVELS
    ] || DIFFICULTY_LEVELS[1];

  // ----------------------------------------------------
  // API helpers
  // ----------------------------------------------------

  const getNextQuestion = async (wasLastCorrect: boolean) => {
    try {
      const params = new URLSearchParams({
        lastCorrect: wasLastCorrect.toString(),
        currentStreak: consecutiveCorrect.toString(),
        currentSmartScore: progress?.smart_score?.toString() || "0",
      });

      const response = await fetch(
        `/api/skills/${skillId}/next-question?` + params.toString()
      );

      if (response.ok) {
        const data = await response.json();
        if (data.question) {
          setCurrentQuestion(data.question);
          setCurrentDifficulty(data.difficulty_level);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error getting next question:", err);
      return false;
    }
  };

  const checkMasteryStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/skills/${skillId}/mastery-status`);
      if (response.ok) {
        const data = await response.json();
        return Boolean(data.mastered);
      }
      return false;
    } catch (err) {
      console.error("Error checking mastery status:", err);
      return false;
    }
  };

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (
      !selectedAnswer ||
      showFeedback ||
      !skill ||
      !currentQuestion ||
      !progress
    ) {
      return;
    }

    const correct = selectedAnswer === currentQuestion.correct_answer;

    setIsCorrect(correct);
    setShowFeedback(true);

    // Update session stats
    const newQuestionsAnswered = questionsAnswered + 1;
    const newCorrectAnswers = correctAnswers + (correct ? 1 : 0);
    const newConsecutiveCorrect = correct ? consecutiveCorrect + 1 : 0;

    setQuestionsAnswered(newQuestionsAnswered);
    setCorrectAnswers(newCorrectAnswers);
    setConsecutiveCorrect(newConsecutiveCorrect);

    // SmartScore changes (IXL-style)
    let smartScoreChange = 0;
    if (correct) {
      const basePoints = 2 + currentDifficulty * 2;
      const streakBonus = Math.min(newConsecutiveCorrect * 0.5, 5);
      smartScoreChange = basePoints + streakBonus;
    } else {
      smartScoreChange = -Math.max(1, 6 - currentDifficulty);
    }

    const newSmartScore = Math.max(
      0,
      Math.min(100, (progress.smart_score || 0) + smartScoreChange)
    );
    const newQuestionsAttempted = (progress.questions_attempted || 0) + 1;
    const newQuestionsCorrect =
      (progress.questions_correct || 0) + (correct ? 1 : 0);

    const newProgress: Progress = {
      smart_score: newSmartScore,
      questions_attempted: newQuestionsAttempted,
      questions_correct: newQuestionsCorrect,
      current_streak: newConsecutiveCorrect,
      is_mastered: newSmartScore >= 100,
    };
    setProgress(newProgress);

    // Persist progress
    try {
      await fetch(`/api/skills/${skillId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smart_score: newSmartScore,
          questions_attempted: newQuestionsAttempted,
          questions_correct: newQuestionsCorrect,
          current_streak: newConsecutiveCorrect,
          is_mastered: false,
          time_spent_seconds: 60,
        }),
      });

      // Check mastery
      const hasMastered = await checkMasteryStatus();
      if (hasMastered) {
        await fetch(`/api/skills/${skillId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            smart_score: 100,
            questions_attempted: newQuestionsAttempted,
            questions_correct: newQuestionsCorrect,
            current_streak: newConsecutiveCorrect,
            is_mastered: true,
            time_spent_seconds: 60,
          }),
        });
        setMasteryProgress(100);
        setSessionCompleted(true);
        return;
      }

      // Update mastery progress (approximation)
      const masteryThreshold = skill.mastery_threshold || 80;
      const masteryPercent = Math.min(
        100,
        Math.round((newSmartScore / masteryThreshold) * 100)
      );
      setMasteryProgress(masteryPercent);
    } catch (err) {
      console.error("Error saving progress:", err);
      // non-fatal
    }

    // Ask backend for next question
    const gotNextQuestion = await getNextQuestion(correct);

    if (gotNextQuestion) {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleFinishSession = () => {
    navigate(-1);
  };

  const handleNewSession = () => {
    window.location.reload();
  };

  // ----------------------------------------------------
  // Derived UI sections
  // ----------------------------------------------------

  const renderSessionCompleted = () => {
    if (!skill) return null;

    return (
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-glass">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
            {masteryProgress >= 100 ? "Skill mastered! 🎉" : "Session complete"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-md">
            {masteryProgress >= 100
              ? "You’ve reached the mastery threshold for this skill. Amazing work!"
              : "You’ve finished this practice session. Review your stats and jump back in whenever you’re ready."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatGlass
            label="SmartScore"
            value={progress?.smart_score ?? 0}
            suffix="/100"
            icon={Star}
          />
          <StatGlass
            label="Session accuracy"
            value={`${sessionAccuracy}%`}
            icon={Target}
          />
          <StatGlass
            label="Questions answered"
            value={questionsAnswered}
            icon={Award}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleFinishSession}
          >
            Back to subject
          </GlassButton>
          <GlassButton size="sm" onClick={handleNewSession}>
            Start a new session
          </GlassButton>
        </div>
      </GlassCard>
    );
  };

  const renderNoQuestions = () => (
    <GlassCard className="p-6 sm:p-8 text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mx-auto">
        <Target className="h-8 w-8 text-amber-300" />
      </div>
      <h2 className="text-xl font-semibold text-slate-50">
        {!skill ? "Skill not found" : "No questions available"}
      </h2>
      <p className="text-sm text-slate-300 max-w-md mx-auto">
        {!skill
          ? "We couldn’t find this skill. It may have been removed or is still being set up."
          : "This skill doesn’t have any practice questions yet. Check back soon or choose another skill."}
      </p>
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={() => navigate("/subjects")}
      >
        Back to subjects
      </GlassButton>
    </GlassCard>
  );

  const renderPracticeView = () => {
    if (!skill || !currentQuestion) {
      return renderNoQuestions();
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)]">
        {/* Left: question & answers */}
        <GlassCard className="p-5 sm:p-6 space-y-4">
          {/* Skill header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-brand-accent shadow-glass">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-50">
                  {skill.name}
                </h1>
                {skill.description && (
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {skill.description}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1">
              <DifficultyBadge info={difficultyInfo} level={currentDifficulty} />
              <span className="text-[11px] text-slate-400">
                Q{questionsAnswered + 1}
              </span>
            </div>
          </div>

          {/* Question text */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-900/30 px-4 py-4">
            <p className="text-sm sm:text-base text-slate-50 leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Options (randomised) */}
          <div className="space-y-3 pt-2">
            {shuffledOptions.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correct_answer;

              let classes =
                "border border-white/15 bg-white/5 hover:bg-white/10";
              if (showFeedback) {
                if (isCorrectOption) {
                  classes =
                    "border-emerald-400/70 bg-emerald-400/10 ring-1 ring-emerald-300/60";
                } else if (isSelected && !isCorrect) {
                  classes =
                    "border-rose-400/80 bg-rose-400/10 ring-1 ring-rose-400/70";
                } else {
                  classes = "border-white/10 bg-white/5 opacity-60";
                }
              } else if (isSelected) {
                classes =
                  "border-brand-accent/80 bg-brand-soft/15 ring-1 ring-brand-accent/70";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={showFeedback}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm sm:text-base text-slate-50 transition-transform duration-150 ${
                    showFeedback
                      ? "cursor-default"
                      : "cursor-pointer hover:scale-[1.01]"
                  } ${classes}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] text-slate-100">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback + actions */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <GlassButton
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedAnswer || showFeedback}
            >
              Check answer
            </GlassButton>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                SmartScore:{" "}
                <span className="text-slate-100 font-semibold">
                  {progress?.smart_score ?? 0}
                </span>
              </span>
              <span className="opacity-60">•</span>
              <span>Streak: {consecutiveCorrect}</span>
            </div>
          </div>

          {showFeedback && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isCorrect ? "text-emerald-100" : "text-rose-100"
                    }`}
                  >
                    {isCorrect ? "Correct! 🎉" : "Not quite right"}
                    {isCorrect && consecutiveCorrect >= 2 && (
                      <> • {consecutiveCorrect}x streak!</>
                    )}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-slate-100">
                    {currentQuestion.explanation}
                  </p>
                  {!isCorrect && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>
                        Focus on{" "}
                        <span className="font-semibold">
                          why the correct option works
                        </span>{" "}
                        instead of memorising the answer.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowHint((v) => !v);
                  }}
                >
                  {showHint ? "Hide hint" : "Show hint"}
                </GlassButton>
              </div>

              {showHint && (
                <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100">
                  Try re-writing the question in your own words and identify
                  what is actually being asked before looking at options.
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Right: stats & progression */}
        <div className="space-y-4">
          <GlassCard className="p-4 sm:p-5 space-y-3">
            <DifficultyBadge info={difficultyInfo} level={currentDifficulty} />

            <div className="grid grid-cols-2 gap-3">
              <StatGlass
                label="SmartScore"
                value={progress?.smart_score ?? 0}
                suffix="/100"
                icon={Star}
              />
              <StatGlass
                label="Accuracy"
                value={
                  progress && progress.questions_attempted > 0
                    ? `${Math.round(
                        (progress.questions_correct /
                          progress.questions_attempted) *
                          100
                      )}%`
                    : "—"
                }
                icon={Target}
              />
              <StatGlass
                label="Questions attempted"
                value={progress?.questions_attempted ?? 0}
                icon={Award}
              />
              <StatGlass
                label="Current streak"
                value={progress?.current_streak ?? 0}
                icon={TrendingUp}
              />
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Mastery progress
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-brand-accent to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(masteryProgress, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300">
                {masteryProgress >= 100
                  ? "Mastery achieved for this skill."
                  : `Approx. ${Math.round(
                      masteryProgress
                    )}% of mastery threshold reached.`}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-slate-300">
                Session accuracy:{" "}
                <span className="font-semibold text-slate-50">
                  {sessionAccuracy}%
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Answer carefully to build a strong SmartScore curve.
              </p>
            </div>
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Clock className="h-5 w-5 text-slate-100" />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // Final render
  // ----------------------------------------------------

  if (sessionCompleted) {
    return (
      <AppLayout
        title={skill ? `Skill mastered: ${skill.name}` : "Session complete"}
        description="Review your SmartScore and accuracy, then jump into a new session."
      >
        {renderSessionCompleted()}
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={skill ? skill.name : "Skill practice"}
      description={
        skill
          ? "Adaptive NATED-style practice that adjusts to your answers."
          : "Adaptive practice session for this skill."
      }
      loading={loading}
      error={error}
    >
      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </GlassButton>
          </div>
          {!skill || !currentQuestion
            ? renderNoQuestions()
            : renderPracticeView()}
        </div>
      )}
    </AppLayout>
  );
}

// ----------------------------------------------------
// Small glass subcomponents
// ----------------------------------------------------

function DifficultyBadge({
  info,
  level,
}: {
  info: { name: string; color: string; description: string };
  level: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-100">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r ${info.color}`}
      >
        <span className="text-[10px] font-semibold text-white">{level}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">{info.name}</span>
        <span className="text-[10px] text-slate-300">{info.description}</span>
      </div>
    </div>
  );
}

function StatGlass({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Icon className="h-4 w-4 text-slate-50" />
        </div>
        <span className="text-xs font-medium text-slate-200">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-50">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-normal text-slate-300">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}
