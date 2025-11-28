import { Flame } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  bestStreak: number;
}

export default function StreakTracker({ currentStreak, bestStreak }: StreakTrackerProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-gray-900">{currentStreak} days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Best Streak</p>
          <p className="text-xl font-bold text-orange-600">{bestStreak} days</p>
        </div>
      </div>

      {/* Week visualization */}
      <div className="flex gap-2 justify-between">
        {days.map((day, index) => {
          const isActive = index <= today && index >= today - currentStreak;
          return (
            <div
              key={index}
              className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
