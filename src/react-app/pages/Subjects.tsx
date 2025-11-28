import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, ChevronRight } from "lucide-react";

import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";
import { GlassButton } from "@/react-app/components/ui/GlassButton";
import { LoadingSpinner } from "@/react-app/components/ui/LoadingSpinner";

/* ----------------------------------------------------------
   Mock subjects for now — replace with API later
---------------------------------------------------------- */
interface Subject {
  id: number;
  name: string;
  grade: string;
  color: string;
  description: string;
  progress: number; // mastery
}

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    name: "Mathematics N3",
    grade: "NATED N3",
    description: "Algebra, finance, functions, trigonometry & more.",
    color: "from-sky-400 to-cyan-400",
    progress: 72,
  },
  {
    id: 2,
    name: "Electrotechnics N2",
    grade: "NATED N2",
    description: "Electrical principles, AC/DC circuits, theory.",
    color: "from-emerald-400 to-green-500",
    progress: 48,
  },
  {
    id: 3,
    name: "Engineering Drawing N3",
    grade: "NATED N3",
    description: "First-angle projection, sections, isometrics.",
    color: "from-amber-400 to-orange-500",
    progress: 33,
  },
  {
    id: 4,
    name: "Mechanotechnics N2",
    grade: "NATED N2",
    description: "Forces, friction, motion & basic mechanics.",
    color: "from-purple-500 to-fuchsia-500",
    progress: 15,
  },
];

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Simulate API loading */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((res) => setTimeout(res, 400));
        setSubjects(MOCK_SUBJECTS);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch subjects.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AppLayout
      title="Subjects"
      description="Explore your NATED subjects and choose a module to study."
      loading={loading}
      error={error}
    >
      {loading && (
        <LoadingSpinner fullScreen message="Loading subjects..." />
      )}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <GlassCard
              key={subject.id}
              className="p-5 cursor-pointer"
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>

                <GlassButton
                  size="sm"
                  variant="secondary"
                  className="text-[11px] px-2 py-1"
                >
                  Open
                  <ChevronRight className="h-3 w-3" />
                </GlassButton>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-semibold text-white">
                  {subject.name}
                </h2>
                <p className="mt-1 text-xs text-slate-300">{subject.grade}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {subject.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                  Mastery progress
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
                  <div
                    className={`h-full bg-gradient-to-r ${subject.color}`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {subject.progress}% mastered
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
