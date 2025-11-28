import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Award, Trophy, Star, Zap, Target, TrendingUp, Lock } from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import type { MochaUser } from "@getmocha/users-service/shared";



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

// --- 1. MOCK USER ---
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

// --- 2. MOCK ACHIEVEMENT DATA ---
const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: "First Steps", description: "Complete your first practice session", badge_icon_url: null, achievement_type: "first_question", points_value: 50, is_earned: true, earned_at: "2023-10-20" },
  { id: 2, name: "On Fire", description: "Reach a 7-day streak", badge_icon_url: null, achievement_type: "streak", points_value: 100, is_earned: true, earned_at: "2023-10-27" },
  { id: 3, name: "Math Whiz", description: "Master 5 Mathematics skills", badge_icon_url: null, achievement_type: "skills_mastered", points_value: 200, is_earned: false, progress: 3, total: 5 },
  { id: 4, name: "Sharp Shooter", description: "Answer 50 questions correctly", badge_icon_url: null, achievement_type: "correct_answers", points_value: 150, is_earned: false, progress: 35, total: 50 },
  { id: 5, name: "Level Up", description: "Reach Level 5", badge_icon_url: null, achievement_type: "level", points_value: 500, is_earned: false, progress: 3, total: 5 },
];

const MOCK_LEVEL: UserLevel = {
  current_level: 3,
  current_xp: 2350,
  xp_for_next_level: 3000,
  total_achievements: 5,
  earned_achievements: 2,
};

export default function Achievements() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [levelInfo] = useState<UserLevel>(MOCK_LEVEL);

  const displayUser = user || MOCK_USER;

  // Disable redirect
  useEffect(() => {}, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const earnedAchievements = achievements.filter((a) => a.is_earned);
  const lockedAchievements = achievements.filter((a) => !a.is_earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation onLogout={handleLogout} user={displayUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements & Rewards</h1>
          <p className="text-gray-600">Track your accomplishments and unlock rewards</p>
        </div>

        {/* Level Progress */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Level {levelInfo.current_level}</h2>
              <p className="text-indigo-100">
                {levelInfo.current_xp} / {levelInfo.xp_for_next_level} XP to next level
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min((levelInfo.current_xp / levelInfo.xp_for_next_level) * 100, 100)}%`,
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <Star className="w-5 h-5 text-yellow-300" />
                <p className="text-sm text-indigo-100">Total XP</p>
              </div>
              <p className="text-2xl font-bold">{levelInfo.current_xp}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <Award className="w-5 h-5 text-yellow-300" />
                <p className="text-sm text-indigo-100">Achievements</p>
              </div>
              <p className="text-2xl font-bold">
                {levelInfo.earned_achievements} / {levelInfo.total_achievements}
              </p>
            </div>
          </div>
        </div>

        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Unlocked Achievements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Locked Achievements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
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
    <div
      className={`relative rounded-xl p-6 border transition-all duration-300 ${
        isEarned
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg hover:shadow-xl"
          : "bg-white border-gray-200 opacity-75"
      }`}
    >
      {!isEarned && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
            isEarned
              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
              : "bg-gray-200"
          }`}
        >
          <Icon className={`w-7 h-7 ${isEarned ? "text-white" : "text-gray-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-1 ${isEarned ? "text-gray-900" : "text-gray-600"}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${isEarned ? "text-gray-700" : "text-gray-500"}`}>
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isEarned ? "text-orange-500" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold ${isEarned ? "text-orange-600" : "text-gray-500"}`}>
            {achievement.points_value} XP
          </span>
        </div>
        {isEarned && achievement.earned_at && (
          <span className="text-xs text-gray-500">
            {new Date(achievement.earned_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {!isEarned && achievement.progress !== undefined && achievement.total !== undefined && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {achievement.progress} / {achievement.total}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
              style={{
                width: `${Math.min((achievement.progress / achievement.total) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}