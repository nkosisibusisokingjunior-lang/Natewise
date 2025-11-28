import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import SubjectsPage from "@/react-app/pages/Subjects";
import SubjectDetailPage from "@/react-app/pages/SubjectDetail";
import ModuleDetailPage from "@/react-app/pages/ModuleDetail";
import SkillPracticePage from "@/react-app/pages/SkillPractice";
import AnalyticsPage from "@/react-app/pages/Analytics";
import AchievementsPage from "@/react-app/pages/Achievements";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import DailyChallengesPage from "@/react-app/pages/DailyChallenges";
import AdminContentManager from "@/react-app/pages/AdminContentManager";
import JsonBulkImporter from "@/react-app/pages/JsonBulkImporter";


// Development wrapper component to bypass auth
const DevRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default function App() {
  const devMode = true; // Set to true for development

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Wrap all authenticated routes with development bypass */}
          <Route path="/dashboard" element={
            devMode ? <DashboardPage /> : <DevRouteWrapper><DashboardPage /></DevRouteWrapper>
          } />
          <Route path="/subjects" element={
            devMode ? <SubjectsPage /> : <DevRouteWrapper><SubjectsPage /></DevRouteWrapper>
          } />
          <Route path="/subjects/:id" element={
            devMode ? <SubjectDetailPage /> : <DevRouteWrapper><SubjectDetailPage /></DevRouteWrapper>
          } />
          <Route path="/modules/:id" element={
            devMode ? <ModuleDetailPage /> : <DevRouteWrapper><ModuleDetailPage /></DevRouteWrapper>
          } />
          <Route path="/skills/:id/practice" element={
            devMode ? <SkillPracticePage /> : <DevRouteWrapper><SkillPracticePage /></DevRouteWrapper>
          } />
          <Route path="/analytics" element={
            devMode ? <AnalyticsPage /> : <DevRouteWrapper><AnalyticsPage /></DevRouteWrapper>
          } />
          <Route path="/achievements" element={
            devMode ? <AchievementsPage /> : <DevRouteWrapper><AchievementsPage /></DevRouteWrapper>
          } />
          <Route path="/leaderboard" element={
            devMode ? <LeaderboardPage /> : <DevRouteWrapper><LeaderboardPage /></DevRouteWrapper>
          } />
          <Route path="/daily-challenges" element={
            devMode ? <DailyChallengesPage /> : <DevRouteWrapper><DailyChallengesPage /></DevRouteWrapper>
          } />

          <Route path="/admin/content" element={
            devMode ? <AdminContentManager /> : <DevRouteWrapper><AdminContentManager /></DevRouteWrapper>
          } />

          <Route path="/admin/bulk-import" element={
            devMode ? <JsonBulkImporter /> : <DevRouteWrapper><JsonBulkImporter /></DevRouteWrapper>
          } />
       
        </Routes>
      </Router>
    </AuthProvider>
  );
}