import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { BookOpen, ChevronRight, Target } from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import ProgressRing from "@/react-app/components/ProgressRing";
import type { Module, Topic } from "@/shared/types";

interface ModuleWithTopics extends Module {
  topics: Topic[];
  subject?: {
    id: number;
    name: string;
    code: string;
    color_hex: string | null;
  };
}

export default function ModuleDetail() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [module, setModule] = useState<ModuleWithTopics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //if (!isPending && !user) {
   //   navigate("/");
   // }
  }, [user, isPending, navigate]);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${id}`);
        if (!response.ok) {
          throw new Error("Module not found");
        }
        const data = await response.json();
        setModule(data);
      } catch (error) {
        console.error("Failed to fetch module:", error);
        navigate("/subjects");
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchModule();
    }
  }, [user, id, navigate]);

  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-200 rounded-full"></div>
          <div className="h-4 w-32 bg-indigo-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation onLogout={handleLogout} user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  const colorClass = module.subject?.color_hex || "from-indigo-500 to-purple-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation onLogout={handleLogout} user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/subjects/${module.subject_id}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Back to {module.subject?.name || "Subject"}
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
              {module.subject && (
                <p className="text-gray-600">{module.subject.name}</p>
              )}
            </div>
          </div>
          {module.description && (
            <p className="text-gray-700 text-lg">{module.description}</p>
          )}
        </div>

        {/* Topics */}
        {module.topics.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics available yet</h3>
            <p className="text-gray-600">Topics will appear here once they're added to this module.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {module.topics.map((topic) => (
              <TopicSection
                key={topic.id}
                topic={topic}
                colorClass={colorClass}
                onSkillClick={(skillId) => navigate(`/skills/${skillId}/practice`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TopicSection({ 
  topic, 
  colorClass,
  onSkillClick 
}: { 
  topic: Topic; 
  colorClass: string;
  onSkillClick: (skillId: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{topic.name}</h2>
        {topic.description && (
          <p className="text-gray-600">{topic.description}</p>
        )}
      </div>

      {!topic.skills || topic.skills.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600">No skills available yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {topic.skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              colorClass={colorClass}
              onClick={() => onSkillClick(skill.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({ 
  skill, 
  colorClass,
  onClick 
}: { 
  skill: any; 
  colorClass: string;
  onClick: () => void;
}) {
  const difficultyStars = "★".repeat(skill.difficulty_level) + "☆".repeat(5 - skill.difficulty_level);

  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-r from-gray-50 to-white rounded-xl shadow hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-transparent text-left hover:scale-[1.02] relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center shadow-md`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{skill.name}</h3>
              <p className="text-sm text-yellow-600">{difficultyStars}</p>
            </div>
          </div>
          {skill.description && (
            <p className="text-gray-600 text-sm mb-3 ml-13">{skill.description}</p>
          )}
          <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all ml-13">
            <span className="text-sm">Start Practicing</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex-shrink-0">
          <ProgressRing 
            progress={skill.smart_score || 0} 
            size={80}
            strokeWidth={6}
            color={skill.smart_score >= 90 ? '#10b981' : skill.smart_score >= 70 ? '#f59e0b' : '#6366f1'}
          />
        </div>
      </div>
    </button>
  );
}
