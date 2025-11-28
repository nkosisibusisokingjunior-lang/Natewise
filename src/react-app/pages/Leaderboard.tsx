import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Zap, Medal, Crown } from "lucide-react";
import Navigation from "@/react-app/components/Navigation";
import type { MochaUser } from "@getmocha/users-service/shared";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  is_current_user: boolean;
}

interface LeaderboardData {
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
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

// --- 2. MOCK LEADERBOARD DATA ---
const MOCK_LEADERBOARD: LeaderboardData = {
  weekly: [
    { rank: 1, user_id: "u1", display_name: "Thabo M.", avatar_url: null, score: 2500, is_current_user: false },
    { rank: 2, user_id: "u2", display_name: "Lerato K.", avatar_url: null, score: 2350, is_current_user: false },
    { rank: 3, user_id: "u3", display_name: "Sibusiso Nkosi", avatar_url: null, score: 2100, is_current_user: true }, // Current User
    { rank: 4, user_id: "u4", display_name: "Kevin D.", avatar_url: null, score: 1800, is_current_user: false },
    { rank: 5, user_id: "u5", display_name: "Sarah L.", avatar_url: null, score: 1500, is_current_user: false },
  ],
  monthly: [
    { rank: 1, user_id: "u2", display_name: "Lerato K.", avatar_url: null, score: 8500, is_current_user: false },
    { rank: 2, user_id: "u1", display_name: "Thabo M.", avatar_url: null, score: 8100, is_current_user: false },
    { rank: 3, user_id: "u4", display_name: "Kevin D.", avatar_url: null, score: 7200, is_current_user: false },
    { rank: 12, user_id: "u3", display_name: "Sibusiso Nkosi", avatar_url: null, score: 4500, is_current_user: true },
  ],
  allTime: [
    { rank: 1, user_id: "u5", display_name: "Sarah L.", avatar_url: null, score: 50000, is_current_user: false },
    { rank: 2, user_id: "u1", display_name: "Thabo M.", avatar_url: null, score: 48000, is_current_user: false },
    { rank: 3, user_id: "u2", display_name: "Lerato K.", avatar_url: null, score: 46500, is_current_user: false },
    { rank: 45, user_id: "u3", display_name: "Sibusiso Nkosi", avatar_url: null, score: 12000, is_current_user: true },
  ]
};

export default function Leaderboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data] = useState<LeaderboardData>(MOCK_LEADERBOARD); // Load mock data directly
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "allTime">("weekly");

  const displayUser = user || MOCK_USER;

  // Disable redirect
  useEffect(() => {}, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const currentData = data?.[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation onLogout={handleLogout} user={displayUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you stack up against other students</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "weekly" as const, label: "This Week" },
            { key: "monthly" as const, label: "This Month" },
            { key: "allTime" as const, label: "All Time" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {currentData.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <PodiumCard entry={currentData[1]} position={2} />
              {/* 1st Place */}
              <PodiumCard entry={currentData[0]} position={1} />
              {/* 3rd Place */}
              <PodiumCard entry={currentData[2]} position={3} />
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="space-y-3">
          {currentData.slice(3).map((entry) => (
            <LeaderboardRow key={entry.user_id} entry={entry} />
          ))}
        </div>
      </main>
    </div>
  );
}

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: number }) {
  const heights = { 1: "h-56", 2: "h-48", 3: "h-40" };
  const icons = {
    1: { icon: Crown, color: "from-yellow-400 to-amber-500", text: "text-yellow-600" },
    2: { icon: Medal, color: "from-gray-300 to-gray-400", text: "text-gray-600" },
    3: { icon: Medal, color: "from-orange-400 to-amber-600", text: "text-orange-600" },
  };
  const config = icons[position as keyof typeof icons];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 relative">
        {entry.avatar_url ? (
          <img
            src={entry.avatar_url}
            alt={entry.display_name}
            className={`w-20 h-20 rounded-full border-4 ${
              entry.is_current_user ? "border-indigo-500" : "border-white"
            } shadow-xl`}
          />
        ) : (
          <div className={`w-20 h-20 rounded-full border-4 ${
            entry.is_current_user ? "border-indigo-500" : "border-white"
          } bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl`}>
            <span className="text-2xl font-bold text-white">
              {entry.display_name.charAt(0)}
            </span>
          </div>
        )}
        <div className={`absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className={`${heights[position as keyof typeof heights]} w-48 bg-gradient-to-br from-white to-gray-50 rounded-t-2xl shadow-xl border-t-4 border-x-4 ${
        entry.is_current_user ? "border-indigo-500" : "border-gray-200"
      } p-6 flex flex-col items-center justify-between`}>
        <div className="text-center">
          <p className={`text-4xl font-bold mb-2 ${config.text}`}>#{position}</p>
          <p className="font-bold text-gray-900 mb-1 truncate max-w-full">{entry.display_name}</p>
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">{entry.score.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border-2 ${
        entry.is_current_user
          ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700 flex-shrink-0">
          #{entry.rank}
        </div>
        
        {entry.avatar_url ? (
          <img
            src={entry.avatar_url}
            alt={entry.display_name}
            className="w-12 h-12 rounded-full shadow-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-white">
              {entry.display_name.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1">
          <p className="font-bold text-gray-900 mb-1">
            {entry.display_name}
            {entry.is_current_user && (
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                You
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-indigo-600">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
          <span className="text-sm text-gray-600">XP</span>
        </div>
      </div>
    </div>
  );
}