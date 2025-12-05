import { BrowserRouter as Router, Routes, Route } from "react-router";

import { ApiAuthProvider } from "@/react-app/auth/ApiAuth";
import { RequireAuth } from "@/react-app/auth/RequireAuth";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";
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

export default function App() {
  return (
    <ApiAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects"
            element={
              <RequireAuth>
                <SubjectsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <RequireAuth>
                <SubjectDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/modules/:id"
            element={
              <RequireAuth>
                <ModuleDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/skills/:id/practice"
            element={
              <RequireAuth>
                <SkillPracticePage />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <AnalyticsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/achievements"
            element={
              <RequireAuth>
                <AchievementsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireAuth>
                <LeaderboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/daily-challenges"
            element={
              <RequireAuth>
                <DailyChallengesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/content"
            element={
              <RequireAuth>
                <AdminContentManager />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/bulk-import"
            element={
              <RequireAuth>
                <JsonBulkImporter />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ApiAuthProvider>
  );
}
