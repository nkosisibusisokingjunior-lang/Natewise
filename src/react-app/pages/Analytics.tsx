import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { 
  BarChart, 
  Target, 
  Clock, 
  Zap, 
  CheckCircle2, 
  User, 
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  PieChart,
  Activity
} from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import type { MochaUser } from "@getmocha/users-service/shared";

// --- TYPES ---
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

// --- MOCK USER ---
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

// API Calls
const fetchSummaryStats = async (): Promise<SummaryStats> => {
  const response = await fetch('/api/analytics/summary');
  if (!response.ok) throw new Error('Failed to fetch summary stats');
  return response.json();
};

const fetchSubjectBreakdown = async (): Promise<SubjectBreakdown[]> => {
  const response = await fetch('/api/analytics/subject-breakdown');
  if (!response.ok) throw new Error('Failed to fetch subject breakdown');
  return response.json();
};

const fetchRecentSkills = async (): Promise<RecentSkill[]> => {
  const response = await fetch('/api/analytics/recent-skills?limit=10');
  if (!response.ok) throw new Error('Failed to fetch recent skills');
  return response.json();
};

const fetchWeakSkills = async (): Promise<WeakSkill[]> => {
  const response = await fetch('/api/analytics/weak-skills-detailed?limit=10');
  if (!response.ok) throw new Error('Failed to fetch weak skills');
  return response.json();
};

const fetchDailyTime = async (): Promise<DailyTime[]> => {
  const response = await fetch('/api/analytics/daily-time?days=30');
  if (!response.ok) throw new Error('Failed to fetch daily time');
  return response.json();
};

export default function Analytics() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const displayUser = user || MOCK_USER;

  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([]);
  const [recentSkills, setRecentSkills] = useState<RecentSkill[]>([]);
  const [weakSkills, setWeakSkills] = useState<WeakSkill[]>([]);
  const [dailyTime, setDailyTime] = useState<DailyTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, subjectData, recentData, weakData, dailyData] = await Promise.all([
          fetchSummaryStats(),
          fetchSubjectBreakdown(),
          fetchRecentSkills(),
          fetchWeakSkills(),
          fetchDailyTime()
        ]);

        setSummary(summaryData);
        setSubjectBreakdown(subjectData);
        setRecentSkills(recentData);
        setWeakSkills(weakData);
        setDailyTime(dailyData);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation onLogout={handleLogout} user={displayUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your comprehensive analytics...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation onLogout={handleLogout} user={displayUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
              <p className="text-gray-600 mb-4">{error || "No data available"}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation onLogout={handleLogout} user={displayUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SUMMARY REPORT
          </h1>
          <div className="flex items-center justify-center gap-3 text-lg text-gray-600">
            <User className="w-6 h-6" />
            <span className="font-semibold">{displayUser.google_user_data?.given_name || "Student"}'s</span>
            <span>NateWisemocha Accomplishments</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            icon={Zap}
            label="Questions Answered"
            value={summary.total_questions.toLocaleString()}
            description="Total practice questions"
            color="from-blue-500 to-cyan-500"
          />
          <SummaryCard
            icon={Clock}
            label="Time Learning"
            value={summary.total_time.display}
            description="Total time spent practicing"
            color="from-green-500 to-emerald-500"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Skills Practiced"
            value={summary.skills_practiced.toLocaleString()}
            description="Made progress in skills"
            color="from-purple-500 to-pink-500"
          />
          <SummaryCard
            icon={Award}
            label="Skills Mastered"
            value={summary.skills_mastered.toLocaleString()}
            description="Fully mastered skills"
            color="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Subject Breakdown */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">SKILLS PRACTICED BY SUBJECT</h2>
            <div className="grid gap-6">
              {subjectBreakdown.map((subject, index) => (
                <SubjectCard key={index} subject={subject} />
              ))}
            </div>
          </div>

          {/* Time Spent Chart */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">TIME SPENT PRACTICING</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <DailyTimeChart data={dailyTime} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Skills */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                RECENTLY PRACTICED SKILLS
              </h2>
              <span className="text-sm text-gray-500">
                {recentSkills.length} skills
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Practiced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSkills.map((skill, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{skill.subject_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {skill.skill_name}
                            {skill.is_mastered && <Award className="w-4 h-4 text-yellow-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            skill.smart_score >= 90 ? 'bg-green-100 text-green-800' :
                            skill.smart_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {skill.smart_score}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(skill.last_practiced_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Areas to Focus On */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                AREAS TO FOCUS ON
              </h2>
              <span className="text-sm text-gray-500">
                {weakSkills.length} skills need attention
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions Missed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weakSkills.map((skill, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{skill.subject_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{skill.skill_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                          {skill.questions_missed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {skill.smart_score}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mastery Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">MASTERY PROGRESS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MasteryProgress
              label="Mastered"
              count={summary.skills_mastered}
              total={summary.skills_practiced}
              color="from-green-500 to-emerald-500"
              description="Skills with 90%+ proficiency"
            />
            <MasteryProgress
              label="Proficient"
              count={summary.skills_proficient}
              total={summary.skills_practiced}
              color="from-blue-500 to-cyan-500"
              description="Skills with 80-89% proficiency"
            />
            <MasteryProgress
              label="Learning"
              count={summary.skills_practiced - summary.skills_mastered - summary.skills_proficient}
              total={summary.skills_practiced}
              color="from-yellow-500 to-orange-500"
              description="Skills still in progress"
            />
          </div>
        </div>

        {/* Instructional Resources Note */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Learning Resources Available
              </h3>
              <p className="text-blue-800">
                NateWisemocha's instructional resources—including video tutorials, step-by-step lessons, 
                worked examples, and detailed answer explanations—are easy to access and available 
                whenever you need them. Remember to carefully read explanations before moving on to the next question!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Component for summary cards
function SummaryCard({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center shadow-md`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Component for subject breakdown
function SubjectCard({ subject }: { subject: SubjectBreakdown }) {
  const totalSkills = subject.skills_practiced;
  const masteredPercent = totalSkills > 0 ? (subject.skills_mastered / totalSkills) * 100 : 0;
  const proficientPercent = totalSkills > 0 ? (subject.skills_proficient / totalSkills) * 100 : 0;
  const learningPercent = 100 - masteredPercent - proficientPercent;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{subject.subject_name}</h3>
          <p className="text-sm text-gray-600">{totalSkills} skills practiced</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(subject.average_score)}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Mastery Progress</span>
          <span>{subject.skills_mastered} mastered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
            style={{ width: `${masteredPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600">{subject.skills_mastered}</div>
          <div className="text-xs text-gray-600">Mastered</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">{subject.skills_proficient}</div>
          <div className="text-xs text-gray-600">Proficient</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-600">
            {totalSkills - subject.skills_mastered - subject.skills_proficient}
          </div>
          <div className="text-xs text-gray-600">Learning</div>
        </div>
      </div>
    </div>
  );
}

// Component for daily time chart with better error handling
function DailyTimeChart({ data }: { data: DailyTime[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No practice data available yet</p>
        <p className="text-sm mt-2">Start practicing to see your progress!</p>
      </div>
    );
  }

  const maxTime = Math.max(...data.map(d => d.total_seconds), 1);
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        Last {Math.min(data.length, 14)} days of practice
      </div>
      {data.slice(-14).map((day, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-16 text-xs text-gray-500">
            {new Date(day.practice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(day.total_seconds / maxTime) * 100}%` }}
            ></div>
          </div>
          <div className="w-12 text-right text-xs text-gray-600">
            {Math.round(day.total_seconds / 60)}m
          </div>
        </div>
      ))}
    </div>
  );
}

// Component for mastery progress
function MasteryProgress({ 
  label, 
  count, 
  total, 
  color, 
  description 
}: { 
  label: string;
  count: number;
  total: number;
  color: string;
  description: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="text-center">
      <div className={`w-20 h-20 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
        <span className="text-white text-lg font-bold">{Math.round(percentage)}%</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

