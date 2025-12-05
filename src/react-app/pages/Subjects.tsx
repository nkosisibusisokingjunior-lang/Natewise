import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/auth/ApiAuth";
import {
  BookOpen,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { AppLayout } from "@/react-app/components/layout/AppLayout";
import { GlassCard } from "@/react-app/components/ui/GlassCard";

interface Subject {
  id: string;
  name: string;
  code: string;
  nated_level: string;
  description?: string;
  color_hex?: string | null;
  is_active?: boolean;
}

/**
 * Subjects page
 * - Fetches subjects from /api/subjects (same as AdminContentManager)
 * - Allows search + filter by NATED level
 * - Navigates to /subjects/:id on click
 */
export default function Subjects() {
  const { isPending } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects from backend (no more mock data)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch("/api/v1/subjects");
        if (!res.ok) {
          throw new Error(`Failed to fetch subjects: ${res.status.toString()}`);
        }

        const data: Subject[] = await res.json();
        setSubjects(data);
      } catch (err: any) {
        console.error("Failed to fetch subjects:", err);
        setError(
          err?.message || "Failed to load subjects. Please try again later."
        );
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Unique NATED levels for filter chips
  const levels = useMemo(
    () =>
      Array.from(new Set(subjects.map((s) => s.nated_level)))
        .filter(Boolean)
        .sort(),
    [subjects]
  );

  // Filtered subjects for display
  const filteredSubjects = useMemo(() => {
    let list = subjects;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.description &&
            s.description.toLowerCase().includes(q))
      );
    }

    if (selectedLevel) {
      list = list.filter((s) => s.nated_level === selectedLevel);
    }

    return list;
  }, [subjects, searchQuery, selectedLevel]);

  const handleSubjectClick = (subject: Subject) => {
    navigate(`/subjects/${subject.id}`);
  };

  // Loading state handled by AppLayout, but we also handle empty states nicely.
  return (
    <AppLayout
      title="Subjects"
      description="Explore your NATED subjects and choose a module to study."
      loading={loading || isPending}
      error={error}
    >
      {!loading && !error && (
        <div className="space-y-6">
          {/* Controls row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 shadow-glass">
                <Search className="h-4 w-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search by subject, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 flex-1 bg-transparent text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400">View:</span>
              <div className="flex rounded-full bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center rounded-full px-2.5 py-1 text-xs transition ${
                    viewMode === "grid"
                      ? "bg-white/90 text-slate-900 shadow-sm"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`ml-1 flex items-center justify-center rounded-full px-2.5 py-1 text-xs transition ${
                    viewMode === "list"
                      ? "bg-white/90 text-slate-900 shadow-sm"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-white/60">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by level:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel("")}
                className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                  selectedLevel === ""
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glass"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                All
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                    selectedLevel === level
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glass"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  NATED {level}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {filteredSubjects.length === 0 ? (
            <GlassCard className="p-6 text-center text-sm text-slate-300">
              {subjects.length === 0
                ? "No subjects found. Add subjects from the Admin Content Manager."
                : "No subjects match your search and filters. Try clearing your filters."}
            </GlassCard>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => handleSubjectClick(subject)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubjects.map((subject) => (
                <SubjectListRow
                  key={subject.id}
                  subject={subject}
                  onClick={() => handleSubjectClick(subject)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

// ------------------------------------------------------------------
// Small sub-components
// ------------------------------------------------------------------

function SubjectCard({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  return (
    <GlassCard
      as="button"
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col items-stretch gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-accent/60 hover:bg-slate-900/70 hover:shadow-glass"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            NATED {subject.nated_level}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-50 sm:text-base">
            {subject.name}
          </h3>
          <p className="text-[11px] text-slate-400">{subject.code}</p>
        </div>
      </div>

      {subject.description && (
        <p className="flex-1 text-xs text-slate-300 line-clamp-3">
          {subject.description}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Tap to view modules</span>
        <span className="inline-flex items-center gap-1 text-brand-accent">
          <span className="font-medium text-[11px]">Open</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </GlassCard>
  );
}

function SubjectListRow({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  return (
    <GlassCard
      as="button"
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left transition hover:border-brand-accent/60 hover:bg-slate-900/60 hover:shadow-glass"
    >
      <div className="flex items-center gap-3">
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 sm:flex">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-50">{subject.name}</h3>
          <p className="text-[11px] text-slate-400">
            {subject.code} - NATED {subject.nated_level}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-slate-400 sm:inline">
          View modules
        </span>
        <ChevronRight className="h-4 w-4 text-brand-accent group-hover:translate-x-0.5 transition-transform" />
      </div>
    </GlassCard>
  );
}
