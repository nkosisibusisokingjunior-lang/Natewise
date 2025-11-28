import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import ModuleDetail from "./pages/ModuleDetail";
import SkillPractice from "./pages/SkillPractice";
import Analytics from "./pages/Analytics";
import Usage from "./pages/Usage";
import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";
import DailyChallenges from "./pages/DailyChallenges";
import AdminContentManager from "./pages/AdminContentManager";
import JsonBulkImporter from "./pages/JsonBulkImporter";
import AuthCallback from "./pages/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "subjects", element: <Subjects /> },
      { path: "subjects/:id", element: <SubjectDetail /> },
      { path: "modules/:id", element: <ModuleDetail /> },
      { path: "skills/:id/practice", element: <SkillPractice /> },
      { path: "analytics", element: <Analytics /> },
      { path: "usage", element: <Usage /> },
      { path: "leaderboard", element: <Leaderboard /> },
      { path: "achievements", element: <Achievements /> },
      { path: "daily-challenges", element: <DailyChallenges /> },
      { path: "admin/content", element: <AdminContentManager /> },
      { path: "admin/import", element: <JsonBulkImporter /> },
      { path: "auth/callback", element: <AuthCallback /> },
    ],
  },
]);