import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, ArrowDown, ArrowRight, BarChart3, Bell, Building2,
  Check, CheckCircle2, ChevronDown, ChevronRight, Circle, ClipboardList,
  Clock3, Copy, Download, ExternalLink, FileText, FolderKanban, Filter,
  Gauge, HelpCircle, LayoutDashboard, Lightbulb, LockKeyhole, LogOut,
  Mail, Menu, MessageCircleQuestion, MessageSquareText, MoreHorizontal,
  Pencil, Plus, Search, Send, Settings, Share2, ShieldCheck, Sparkles,
  Target, Trash2, TrendingUp, Upload, UserRound, Users, Workflow, X,
} from "lucide-react";
import { Logo, Button, Badge, ProgressBar, Toast, PageHeader, StatCard, WorkflowVisualization } from "../components/shared";

function Sidebar({ path, collapsed, onToggle, mobileOpen, onMobileClose, navigate }: { path: string; collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void; navigate: (path: string) => void }) {
  const [customerExpanded, setCustomerExpanded] = useState(true);
  const [requirementsExpanded, setRequirementsExpanded] = useState(true);
  const isRequirement = path.startsWith("/requirement") || path === "/requirements-list" || path === "/clarifications";

  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const customerNav = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "New Analysis", path: "/discovery", icon: Sparkles },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Discovery Requirements", path: "/discovery-requirements", icon: ClipboardList },
    { label: "Questions", path: "/questions", icon: MessageCircleQuestion, badge: metrics?.unansweredQuestions ? String(metrics.unansweredQuestions) : "4" },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Intelligence", path: "/intelligence", icon: BarChart3 },
  ];

  const requirementNav = [
    { label: "Dashboard", path: "/requirement-intelligence", icon: LayoutDashboard },
    { label: "New Requirement Analysis", path: "/requirement-analysis", icon: Sparkles },
    { label: "Requirements", path: "/requirements-list", icon: FolderKanban },
    { label: "Clarifications", path: "/clarifications", icon: MessageCircleQuestion, badge: metrics?.openClarifications ? String(metrics.openClarifications) : "3" },
    { label: "Issues", path: "/requirement-issues", icon: AlertCircle, badge: metrics?.openIssues ? String(metrics.openIssues) : "4" },
    { label: "Reports", path: "/requirement-reports", icon: FileText },
    { label: "Intelligence", path: "/requirement-intelligence/analytics", icon: BarChart3 },
  ];

  const renderNav = (items: typeof customerNav) => (
    <div className="nav-list">
      {items.map(({ label, path: itemPath, icon: Icon, badge }) => {
        const active = path === itemPath || (itemPath === "/projects" && path.startsWith("/projects/"));
        return (
          <button
            key={itemPath}
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => {
              navigate(itemPath);
              onMobileClose();
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="sidebar-close" onClick={onMobileClose}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-parent" onClick={() => setCustomerExpanded((v) => !v)}>
          <span className="workspace-parent-icon">
            <Workflow size={16} />
          </span>
          <span>Customer Discovery</span>
          <ChevronDown size={15} className={customerExpanded ? "rotate-180" : ""} />
        </button>
        {customerExpanded && renderNav(customerNav)}
        <button
          className={`workspace-parent requirement-parent ${isRequirement ? "selected" : ""}`}
          onClick={() => setRequirementsExpanded((v) => !v)}
        >
          <span className="workspace-parent-icon requirement-icon">
            <Sparkles size={15} />
          </span>
          <span>Requirement Intelligence</span>
          <ChevronDown size={15} className={requirementsExpanded ? "rotate-180" : ""} />
        </button>
        {requirementsExpanded && renderNav(requirementNav)}
        <div className="sidebar-divider" />
        <div className="workspace-label">MANAGEMENT</div>
        <button
          className={`nav-item ${path === "/settings" ? "active" : ""}`}
          onClick={() => {
            navigate("/settings");
            onMobileClose();
          }}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <button
          className={`nav-item ${path === "/profile" ? "active" : ""}`}
          onClick={() => {
            navigate("/profile");
            onMobileClose();
          }}
        >
          <UserRound size={16} />
          <span>Profile</span>
        </button>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <div className="tip-spark">
            <Sparkles size={15} />
          </div>
          <strong>{isRequirement ? "Make requirements ready." : "Make your next question count."}</strong>
          <span>
            {isRequirement
              ? `CLARIVON AI found ${metrics?.openClarifications ?? 3} open clarifications in your active project.`
              : `CLARIVON AI found ${metrics?.openIssues ?? 4} context gaps in your active project.`}
          </span>
          <button onClick={() => navigate(isRequirement ? "/clarifications" : "/discovery")}>
            {isRequirement ? "Review clarifications" : "Review gaps"} <ArrowRight size={13} />
          </button>
        </div>
        <div className="profile-mini">
          <div className="avatar">{userProfile?.avatar || "JD"}</div>
          <div className="profile-mini-info">
            <strong>{userProfile?.name || "John Doe"}</strong>
            <span>{userProfile?.role || "Product Manager"}</span>
          </div>
          <button onClick={() => navigate("/profile")}>
            <MoreHorizontal size={17} />
          </button>
        </div>
        <button className="collapse-button" onClick={onToggle}>
          <ChevronRight size={16} className={!collapsed ? "rotate-180" : ""} />
          <span>Collapse sidebar</span>
        </button>
      </aside>
      {mobileOpen && <button className="sidebar-overlay" onClick={onMobileClose} aria-label="Close navigation" />}
    </>
  );
}

function Topbar({ title, subtitle, onMenu, navigate, onToast }: { title?: string; subtitle?: string; onMenu: () => void; navigate: (path: string) => void; onToast: (message: string) => void }) {
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="mobile-menu" onClick={onMenu}>
          <Menu size={20} />
        </button>
        <div>
          <h1>{title || "Customer Discovery"}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={16} />
          <input placeholder="Search workspace" />
          <kbd>⌘ K</kbd>
        </div>
        <button className="icon-button" onClick={() => onToast("You’re all caught up.")}>
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <button className="topbar-avatar" onClick={() => navigate("/profile")}>
          {userProfile?.avatar || "JD"}
        </button>
      </div>
    </header>
  );
}

function AppShell({ path, navigate, children, onToast }: { path: string; navigate: (path: string) => void; children: ReactNode; onToast: (message: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar path={path} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} navigate={navigate} />
      <div className={`app-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar title={path.startsWith("/requirement") || path === "/requirements-list" || path === "/clarifications" ? "Requirement Intelligence" : "Customer Discovery"} onMenu={() => setMobileOpen(true)} navigate={navigate} onToast={onToast} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export { Sidebar, Topbar, AppShell };
