import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { BookOpen, Target, ChevronRight, Puzzle, Zap, TrendingUp, Clock, Award, Play } from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import type { MochaUser } from "@getmocha/users-service/shared";

// --- TYPES ---
interface Subject {
  id: number;
  name: string;
  code: string;
  nated_level: string;
  description: string;
  color_hex: string;
  modules?: Module[];
}

interface Module {
  id: number;
  subject_id: number;
  name: string;
  description: string;
  display_order: number;
  topics?: Topic[];
}

interface Topic {
  id: number;
  module_id: number;
  name: string;
  description: string;
  display_order: number;
  skills?: Skill[];
}

interface Skill {
  id: number;
  topic_id: number;
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

// --- MOCK USER (fallback) ---
const MOCK_USER: MochaUser = {
  id: "dev-user",
  email: "sibusiso@example.com",
  google_sub: "dev-google-sub",
  last_signed_in_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  google_user_data: {
    given_name: "Sibusiso King-Junior",
    name: "Sibusiso King-Junior Nkosi",
    picture: null,
    email: "sibusiso@example.com",
    email_verified: true,
    sub: "dev-google-sub"
  }
};

export default function SubjectDetail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const displayUser = user || MOCK_USER;
  const subjectId = parseInt(id || '0');

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subject data from API
  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/subjects/${subjectId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch subject: ${response.statusText}`);
        }
        
        const subjectData = await response.json();
        setSubject(subjectData);
      } catch (err) {
        console.error("Error fetching subject:", err);
        setError(err instanceof Error ? err.message : "Failed to load subject");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId]);

  // Calculate overall stats
  const calculateStats = () => {
    if (!subject?.modules) return { totalTopics: 0, totalSkills: 0, overallSmartScore: 0, masteredSkills: 0, totalPracticeTime: 0 };

    let totalTopics = 0;
    let totalSkills = 0;
    let totalSmartScore = 0;
    let skillsWithProgress = 0;
    let masteredSkills = 0;
    let totalPracticeTime = 0;

    subject.modules.forEach(module => {
      module.topics?.forEach(topic => {
        totalTopics++;
        topic.skills?.forEach(skill => {
          totalSkills++;
          if (skill.smart_score !== undefined) {
            totalSmartScore += skill.smart_score;
            skillsWithProgress++;
            if (skill.is_mastered) {
              masteredSkills++;
            }
            // Estimate practice time (2 minutes per question attempted)
            totalPracticeTime += (skill.questions_attempted || 0) * 2;
          }
        });
      });
    });

    const overallSmartScore = skillsWithProgress > 0 ? Math.round(totalSmartScore / skillsWithProgress) : 0;

    return {
      totalTopics,
      totalSkills,
      overallSmartScore,
      masteredSkills,
      totalPracticeTime: Math.round(totalPracticeTime / 60) // Convert to minutes
    };
  };

  const stats = calculateStats();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Function to handle skill practice navigation
  const handlePracticeSkill = (skillId: number, skillName: string) => {
    navigate(`/skills/${skillId}/practice`, { 
      state: { skillName, subjectName: subject?.name }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation onLogout={handleLogout} user={displayUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation onLogout={handleLogout} user={displayUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? "Error Loading Subject" : "Subject Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested subject could not be loaded."}
            </p>
            <button
              onClick={() => navigate("/subjects")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Go to Subjects List
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation onLogout={handleLogout} user={displayUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 p-6 rounded-2xl shadow-xl bg-white border border-gray-100">
          <button
            onClick={() => navigate("/subjects")}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 flex items-center gap-2 transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Subjects
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
              <p className="text-lg font-medium text-indigo-600 mb-4">
                {subject.code} • Level {subject.nated_level}
              </p>
              <p className="text-gray-700 max-w-3xl leading-relaxed">{subject.description}</p>
            </div>
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-6"
              style={{ 
                backgroundColor: subject.color_hex || '#3B82F6'
              }}
            >
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Curriculum Modules ({subject.modules?.length || 0})
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {stats.totalSkills} skills across {stats.totalTopics} topics
              </div>
            </div>
            
            <div className="space-y-6">
              {subject.modules?.map(module => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  onPracticeSkill={handlePracticeSkill}
                />
              ))}
            </div>
            
            {(!subject.modules || subject.modules.length === 0) && (
              <div className="p-8 bg-white rounded-xl text-center shadow-lg border border-gray-100">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No modules are currently available for this subject.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for updates</p>
              </div>
            )}
          </div>

          {/* Sidebar / Subject Stats */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Progress</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-4 sticky top-8">
              <StatItem 
                icon={Puzzle} 
                label="Total Modules" 
                value={subject.modules?.length || 0} 
                color="text-indigo-600" 
              />
              <StatItem 
                icon={Target} 
                label="Learning Topics" 
                value={stats.totalTopics} 
                color="text-cyan-600" 
              />
              <StatItem 
                icon={TrendingUp} 
                label="Practice Skills" 
                value={stats.totalSkills} 
                color="text-orange-600" 
              />
              <StatItem 
                icon={Award} 
                label="Mastered Skills" 
                value={stats.masteredSkills} 
                suffix={`/ ${stats.totalSkills}`}
                color="text-green-600" 
              />
              <StatItem 
                icon={Zap} 
                label="Overall SmartScore" 
                value={stats.overallSmartScore} 
                suffix="/100" 
                color="text-purple-600" 
              />
              <StatItem 
                icon={Clock} 
                label="Practice Time" 
                value={stats.totalPracticeTime} 
                suffix="minutes" 
                color="text-blue-600" 
              />
              
              {/* Progress Overview */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round((stats.masteredSkills / stats.totalSkills) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.masteredSkills / stats.totalSkills) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Practice Button */}
              {stats.totalSkills > 0 && (
                <button
                  onClick={() => {
                    // Find first available skill to practice
                    const firstSkill = subject.modules
                      ?.flatMap(m => m.topics || [])
                      .flatMap(t => t.skills || [])
                      .find(s => s.id);
                    
                    if (firstSkill) {
                      handlePracticeSkill(firstSkill.id, firstSkill.name);
                    }
                  }}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Quick Practice
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModuleCard({ module, onPracticeSkill }: { module: Module; onPracticeSkill: (skillId: number, skillName: string) => void }) {
  const allSkills = module.topics?.flatMap(topic => topic.skills || []) || [];
  const masteredSkills = allSkills.filter(skill => skill.is_mastered).length;
  const avgSmartScore = allSkills.length > 0 
    ? Math.round(allSkills.reduce((sum, skill) => sum + (skill.smart_score || 0), 0) / allSkills.length)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              Module {module.display_order}
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">{module.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-indigo-600">{avgSmartScore}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Score</div>
          <div className="text-sm text-green-600 font-medium mt-1">
            {masteredSkills}/{allSkills.length} mastered
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Learning Topics ({module.topics?.length || 0})
          </h4>
        </div>
        
        <div className="space-y-4">
          {module.topics?.map(topic => (
            <TopicSection 
              key={topic.id} 
              topic={topic} 
              onPracticeSkill={onPracticeSkill}
            />
          ))}
        </div>
        
        {(!module.topics || module.topics.length === 0) && (
          <div className="text-center py-6">
            <div className="text-gray-400 text-sm">
              No topics available for this module yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicSection({ topic, onPracticeSkill }: { topic: Topic; onPracticeSkill: (skillId: number, skillName: string) => void }) {
  const skills = topic.skills || [];
  const topicAvgScore = skills.length > 0 
    ? Math.round(skills.reduce((sum, skill) => sum + (skill.smart_score || 0), 0) / skills.length)
    : 0;
  const masteredSkills = skills.filter(skill => skill.is_mastered).length;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:border-gray-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">{topic.name}</h4>
          <p className="text-xs text-gray-600">{topic.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-lg font-bold text-indigo-600">{topicAvgScore}</div>
          <div className="text-xs text-gray-500">Avg Score</div>
          <div className="text-xs text-green-600 font-medium mt-1">
            {masteredSkills}/{skills.length} mastered
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {skills.map(skill => (
          <div 
            key={skill.id} 
            className={`flex items-center justify-between text-sm p-3 rounded-md border transition-all duration-200 cursor-pointer hover:shadow-sm ${
              skill.is_mastered 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
            }`}
            onClick={() => onPracticeSkill(skill.id, skill.name)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${skill.is_mastered ? 'bg-green-100' : 'bg-indigo-100'}`}>
                <Play className={`w-3 h-3 ${skill.is_mastered ? 'text-green-600' : 'text-indigo-600'}`} />
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-800">{skill.name}</span>
                {skill.description && (
                  <p className="text-xs text-gray-600 mt-1">{skill.description}</p>
                )}
              </div>
              {skill.is_mastered && (
                <Award className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-xs text-yellow-600">
                {"★".repeat(skill.difficulty_level)}{"☆".repeat(5 - skill.difficulty_level)}
              </span>
              <span className={`font-bold text-sm ${
                skill.smart_score && skill.smart_score >= 80 ? 'text-green-600' : 
                skill.smart_score && skill.smart_score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {skill.smart_score || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">
            No skills available for this topic
          </div>
        </div>
      )}

      {/* Practice All Button */}
      {skills.length > 0 && (
        <button
          onClick={() => {
            const firstSkill = skills[0];
            if (firstSkill) {
              onPracticeSkill(firstSkill.id, `${topic.name} - ${firstSkill.name}`);
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Play className="w-4 h-4" /> 
          Practice {topic.name}
        </button>
      )}
    </div>
  );
}

function StatItem({ icon: Icon, label, value, suffix, color }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  suffix?: string; 
  color: string; 
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-white transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color.replace('text', 'bg')} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
      </span>
    </div>
  );
}