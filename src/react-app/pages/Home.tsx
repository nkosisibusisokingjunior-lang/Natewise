import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { BookOpen, Target, Trophy, TrendingUp, Award, Zap } from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const devMode = true; // Development mode enabled

  // Bypass authentication in development
  useEffect(() => {
    if (devMode) {
      console.log("Development mode: Authentication bypassed");
      return;
    }
    
    if (!isPending && user) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate, devMode]);

  // Development login handler
  const handleDevLogin = () => {
    console.log("Development login - navigating to dashboard");
    navigate("/dashboard");
  };

  if (isPending && !devMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-200 rounded-full"></div>
          <div className="h-4 w-32 bg-indigo-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 backdrop-blur-3xl"></div>
        
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NateWise
              </span>
            </div>
            <button
              onClick={devMode ? handleDevLogin : redirectToLogin}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {devMode ? "Enter App (Dev)" : "Sign In"}
            </button>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">Development Mode</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Master NATED Courses
              </span>
              <br />
              <span className="text-gray-900">With Confidence</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
              Development Preview - Authentication is disabled for testing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleDevLogin}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Enter Development Mode</span>
                <Target className="w-5 h-5" />
              </button>
            </div>

            {/* Development Info */}
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium">
                🚧 Development Mode Active 🚧
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Authentication is disabled. Click "Enter Development Mode" to explore the app.
                Some features may not work without backend services.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
              <StatItem number="9+" label="Subjects" />
              <StatItem number="1000+" label="Questions" />
              <StatItem number="100%" label="Free" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Excel</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built specifically for NATED students with features that make learning effective and engaging
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={Target}
            title="Adaptive Questions"
            description="Questions adjust to your skill level in real-time for optimal learning"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={Trophy}
            title="SmartScore System"
            description="Track your mastery with our intelligent scoring algorithm (0-100)"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Progress Tracking"
            description="Detailed insights into your learning journey with streaks and stats"
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon={BookOpen}
            title="NATED Aligned"
            description="Curriculum perfectly aligned with N4-N6 course requirements"
            gradient="from-green-500 to-emerald-500"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white/50 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How NateWise Works</h2>
            <p className="text-xl text-gray-600">Simple, effective, and designed for your success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number={1}
              title="Choose Your Subject"
              description="Select from N4-N6 subjects including Engineering Mathematics, Science, Electronics, and more"
              icon={BookOpen}
            />
            <Step
              number={2}
              title="Practice Skills"
              description="Work through adaptive questions that match your current skill level and help you improve"
              icon={Target}
            />
            <Step
              number={3}
              title="Track Progress"
              description="Watch your SmartScore grow as you master each skill and build your knowledge"
              icon={Award}
            />
          </div>
        </div>
      </div>

      {/* Subjects Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Subjects</h2>
          <p className="text-xl text-gray-600">Comprehensive coverage of NATED N4-N6 curriculum</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SubjectCard name="Engineering Mathematics" level="N4-N6" color="from-blue-500 to-indigo-500" />
          <SubjectCard name="Engineering Science" level="N4-N5" color="from-purple-500 to-pink-500" />
          <SubjectCard name="Industrial Electronics" level="N4-N6" color="from-green-500 to-emerald-500" />
          <SubjectCard name="Mechanotechnology" level="N4" color="from-orange-500 to-amber-500" />
          <SubjectCard name="Electrotechnology" level="N4" color="from-yellow-500 to-orange-500" />
          <SubjectCard name="Engineering Drawing" level="N4" color="from-teal-500 to-cyan-500" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master Your NATED Courses?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Development Preview - Explore the platform features
          </p>
          <button
            onClick={handleDevLogin}
            className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-200 hover:scale-105"
          >
            Explore Development Mode
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NateWise
              </span>
            </div>
            <p className="text-gray-600 text-center">
              Development Preview - Empowering South African students to excel in NATED courses
            </p>
            <p className="text-sm text-gray-500">
              © 2025 NateWise. Development Mode Active.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
        {number}
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-transparent">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Step({ 
  number, 
  title, 
  description, 
  icon: Icon 
}: { 
  number: number; 
  title: string; 
  description: string;
  icon: any;
}) {
  return (
    <div className="relative text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-2xl font-bold mb-6 shadow-xl">
        {number}
      </div>
      <div className="mb-4">
        <Icon className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function SubjectCard({ 
  name, 
  level, 
  color 
}: { 
  name: string; 
  level: string; 
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-4 shadow-md`}>
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-600">Level: {level}</p>
    </div>
  );
}