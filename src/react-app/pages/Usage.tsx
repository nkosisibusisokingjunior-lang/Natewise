import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { 
  BarChart, 
  PieChart,
  Clock, 
  Zap, 
  CheckCircle2, 
  User, 
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import type { MochaUser } from "@getmocha/users-service/shared";

// --- TYPES ---
interface UsageSummary {
  total_questions: number;
  total_time: {
    hours: number;
    minutes: number;
    display: string;
  };
  skills_practiced: number;
  skills_with_progress: number;
}

interface CategoryBreakdown {
  category_name: string;
  skills_count: number;
  questions_attempted: number;
  time_spent_seconds: number;
  percentage: number;
}

interface MonthlyBreakdown {
  month: string;
  questions_answered: number;
  skills_practiced: number;
  total_time_seconds: number;
}

interface PracticeSession {
  id: number;
  start_time: string;
  end_time: string;
  questions_attempted: number;
  questions_correct: number;
  skill_id: number;
  skill_name: string;
  subject_name: string;
  time_spent_seconds: number;
  accuracy: number;
}

interface SessionQuestion {
  id: number;
  question_id: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  attempted_at: string;
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

// Date range options
const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" }
];

// API Calls
const fetchUsageSummary = async (startDate?: string, endDate?: string): Promise<UsageSummary> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`/api/analytics/usage/summary?${params}`);
  if (!response.ok) throw new Error('Failed to fetch usage summary');
  return response.json();
};

const fetchCategoryBreakdown = async (startDate?: string, endDate?: string): Promise<CategoryBreakdown[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`/api/analytics/usage/category-breakdown?${params}`);
  if (!response.ok) throw new Error('Failed to fetch category breakdown');
  return response.json();
};

const fetchMonthlyBreakdown = async (startDate?: string, endDate?: string): Promise<MonthlyBreakdown[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`/api/analytics/usage/monthly-breakdown?${params}`);
  if (!response.ok) throw new Error('Failed to fetch monthly breakdown');
  return response.json();
};

const fetchPracticeSessions = async (startDate?: string, endDate?: string, limit: number = 20): Promise<PracticeSession[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  params.append('limit', limit.toString());
  
  const response = await fetch(`/api/analytics/usage/practice-sessions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch practice sessions');
  return response.json();
};

const fetchSessionQuestions = async (sessionId: number): Promise<SessionQuestion[]> => {
  const response = await fetch(`/api/analytics/usage/session-questions?sessionId=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch session questions');
  return response.json();
};

export default function Usage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const displayUser = user || MOCK_USER;

  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [selectedSessionQuestions, setSelectedSessionQuestions] = useState<SessionQuestion[]>([]);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const [dateRange, setDateRange] = useState("year");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let startDate = "";
    let endDate = new Date().toISOString().split('T')[0];

    switch (dateRange) {
      case "today":
        startDate = endDate;
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate;
          endDate = customEndDate;
        }
        break;
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  // Load data when date range changes
  useEffect(() => {
    const loadUsageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = getDateRange();

        const [summaryData, categoryData, monthlyData, sessionsData] = await Promise.all([
          fetchUsageSummary(startDate, endDate),
          fetchCategoryBreakdown(startDate, endDate),
          fetchMonthlyBreakdown(startDate, endDate),
          fetchPracticeSessions(startDate, endDate, 20)
        ]);

        setSummary(summaryData);
        setCategoryBreakdown(categoryData);
        setMonthlyBreakdown(monthlyData);
        setPracticeSessions(sessionsData);
      } catch (err) {
        console.error('Failed to load usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, [dateRange, customStartDate, customEndDate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleViewSessionQuestions = async (sessionId: number) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSelectedSessionQuestions([]);
    } else {
      try {
        const questions = await fetchSessionQuestions(sessionId);
        setSelectedSessionQuestions(questions);
        setExpandedSession(sessionId);
      } catch (error) {
        console.error('Failed to load session questions:', error);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} hr ${remainingMinutes} min`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return "<1 min";
    }
  };

  const formatSessionTime = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation onLogout={handleLogout} user={displayUser} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your usage analytics...</p>
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
        {/* Header with Membership Notice */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Usage Analytics</h1>
              <p className="opacity-90">Detailed breakdown of your learning activity and progress</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Student: {displayUser.google_user_data?.given_name || "User"}</p>
              <p className="text-sm opacity-90">Viewing: {DATE_RANGES.find(r => r.value === dateRange)?.label}</p>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">FILTER BY:</span>
            </div>
            
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <button className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Usage Summary */}
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
            label="Active Skills"
            value={summary.skills_with_progress.toLocaleString()}
            description="Skills with recent activity"
            color="from-orange-500 to-red-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Practice by Category */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">PRACTICE BY CATEGORY</h2>
              <PieChart className="w-6 h-6 text-gray-600" />
            </div>
            <CategoryPieChart data={categoryBreakdown} />
          </div>

          {/* Practice by Month */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">PRACTICE BY MONTH</h2>
              <BarChart className="w-6 h-6 text-gray-600" />
            </div>
            <MonthlyBarChart data={monthlyBreakdown} />
          </div>
        </div>

        {/* Practice Sessions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">PRACTICE SESSIONS AND SKILLS</h2>
            <span className="text-sm text-gray-500">
              {practiceSessions.length} sessions
            </span>
          </div>

          <div className="space-y-4">
            {practiceSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                {/* Session Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewSessionQuestions(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {new Date(session.start_time).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatSessionTime(session.start_time, session.end_time)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          {formatDuration(session.time_spent_seconds)} active practice
                        </span>
                        <span className="text-gray-600">
                          {session.questions_attempted} questions
                        </span>
                        <span className="text-gray-600">
                          1 skill
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skill Info */}
                  <div className="mt-3 ml-9">
                    <div className="font-medium text-gray-900">
                      {session.skill_name}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Accuracy: {session.accuracy}%</span>
                      <span>Subject: {session.subject_name}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Questions View */}
                {expandedSession === session.id && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">QUESTIONS LOG PREVIEW</h4>
                      <div className="space-y-2">
                        {selectedSessionQuestions.slice(0, 3).map((question, index) => (
                          <div key={question.id} className="text-sm text-gray-700 bg-white p-3 rounded border">
                            <div className="font-medium mb-1">
                              {index + 1}. {question.question_text}
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className={question.is_correct ? "text-green-600" : "text-red-600"}>
                                {question.is_correct ? "✓ Correct" : "✗ Incorrect"}
                              </span>
                              <span>Your answer: {question.user_answer}</span>
                              {!question.is_correct && (
                                <span>Correct: {question.correct_answer}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedSessionQuestions.length > 3 && (
                        <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View all {selectedSessionQuestions.length} questions →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {practiceSessions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No practice sessions found for the selected date range</p>
              <p className="text-sm mt-2">Start practicing to see your session history!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Summary Card Component
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

// Category Pie Chart Component
function CategoryPieChart({ data }: { data: CategoryBreakdown[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No category data available</p>
      </div>
    );
  }

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-amber-500',
    'from-indigo-500 to-blue-500'
  ];

  return (
    <div className="space-y-4">
      {/* Pie Chart Visualization */}
      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32">
          {data.slice(0, 5).map((item, index) => {
            const percentage = item.percentage;
            const rotation = data.slice(0, index).reduce((acc, curr) => acc + curr.percentage, 0) * 3.6;
            
            return (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-r ${colors[index % colors.length]} 
                  clip-path-pie`}
                style={{
                  clipPath: `conic-gradient(from ${rotation}deg, transparent 0%, transparent ${percentage}%, #0000 0%)`,
                }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}></div>
              <span className="text-gray-700">{item.category_name}</span>
            </div>
            <span className="font-semibold text-gray-900">{item.percentage}%</span>
          </div>
        ))}
        {data.length > 6 && (
          <div className="text-center text-sm text-gray-500 pt-2">
            +{data.length - 6} more categories
          </div>
        )}
      </div>
    </div>
  );
}

// Monthly Bar Chart Component
function MonthlyBarChart({ data }: { data: MonthlyBreakdown[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No monthly data available</p>
      </div>
    );
  }

  const maxQuestions = Math.max(...data.map(d => d.questions_answered), 1);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Questions answered by month
      </div>
      
      <div className="space-y-3">
        {data.slice().reverse().map((month, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-500">
              {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(month.questions_answered / maxQuestions) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {month.questions_answered}
                </span>
              </div>
            </div>
            <div className="w-16 text-right text-xs text-gray-600">
              {formatDuration(month.total_time_seconds)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}