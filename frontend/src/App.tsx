import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Toast } from "./components/shared";
import { AppShell } from "./layouts/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { RequirementsPage } from "./pages/RequirementsPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { IntelligencePage } from "./pages/IntelligencePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NewRequirementAnalysisPage as RequirementAnalysisPage } from "./pages/NewRequirementAnalysisPage";
import {
  RequirementDashboard,
  RequirementsListPage,
  ClarificationsPage,
  IssuesPage,
  RequirementReportsPage,
  RequirementAnalyticsPage,
} from "./pages/RequirementIntelligencePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import "./index.css";

export default function App() {
  const [path, navigate] = useLocation();
  const [toast, setToast] = useState("");
  const showToast = (message: string) => setToast(message);
  const isPublic = path === "/" || path === "/signin" || path === "/signup";

  const content = useMemo(() => {
    if (path === "/") return <LandingPage navigate={navigate} />;
    if (path === "/signin") return <AuthPage mode="signin" navigate={navigate} />;
    if (path === "/signup") return <AuthPage mode="signup" navigate={navigate} />;
    if (path === "/dashboard" || path === "/discovery/dashboard") return <DashboardPage navigate={navigate} />;
    if (path === "/requirement-intelligence" || path === "/requirements/dashboard") return <RequirementDashboard navigate={navigate} onToast={showToast} />;
    if (path === "/requirement-analysis" || path === "/requirements/new-analysis") return <RequirementAnalysisPage onToast={showToast} />;
    if (path === "/requirements-list" || path === "/requirements/list") return <RequirementsListPage onToast={showToast} />;
    if (path === "/clarifications" || path === "/requirements/clarifications") return <ClarificationsPage onToast={showToast} />;
    if (path === "/requirement-issues" || path === "/requirements/issues") return <IssuesPage onToast={showToast} />;
    if (path === "/requirement-reports" || path === "/requirements/reports") return <RequirementReportsPage onToast={showToast} />;
    if (path === "/requirement-intelligence/analytics" || path === "/requirements/intelligence") return <RequirementAnalyticsPage />;
    if (path === "/discovery" || path === "/discovery/new-analysis") return <DiscoveryPage onToast={showToast} />;
    if (path === "/projects" || path === "/discovery/projects") return <ProjectsPage navigate={navigate} onToast={showToast} />;
    if (path.startsWith("/projects/")) return <ProjectDetailPage navigate={navigate} onToast={showToast} />;
    if (path === "/discovery-requirements" || path === "/discovery/requirements") return <RequirementsPage onToast={showToast} />;
    if (path === "/questions" || path === "/discovery/questions") return <QuestionsPage onToast={showToast} />;
    if (path === "/reports" || path === "/discovery/reports") return <ReportsPage onToast={showToast} />;
    if (path === "/intelligence" || path === "/discovery/intelligence") return <IntelligencePage onToast={showToast} />;
    if (path === "/settings") return <SettingsPage onToast={showToast} />;
    if (path === "/profile") return <ProfilePage navigate={navigate} onToast={showToast} />;
    return <NotFoundPage navigate={navigate} />;
  }, [path, navigate]);

  return (
    <>
      {isPublic ? content : (
        <AppShell path={path} navigate={navigate} onToast={showToast}>
          {content}
        </AppShell>
      )}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}
