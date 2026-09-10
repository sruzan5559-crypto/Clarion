import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Filter,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircleQuestion,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  Workflow,
  X,
} from "lucide-react";
import "./index.css";

const workflowSteps = [
  ["Conversation", "Customer voice", MessageSquareText],
  ["Goal", "What they want", Target],
  ["Stated problem", "What they say", AlertCircle],
  ["Root problem", "What may be underneath", Lightbulb],
  ["Evidence", "What supports it", ShieldCheck],
  ["Questions", "What to ask next", MessageCircleQuestion],
  ["Validation", "How confident to be", Gauge],
] as const;

const customerNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "New Analysis", path: "/discovery", icon: Sparkles },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Discovery Requirements", path: "/discovery-requirements", icon: ClipboardList },
  { label: "Questions", path: "/questions", icon: MessageCircleQuestion, badge: "5" },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Intelligence", path: "/intelligence", icon: BarChart3 },
];

const requirementNavItems = [
  { label: "Dashboard", path: "/requirement-intelligence", icon: LayoutDashboard },
  { label: "New Requirement Analysis", path: "/requirement-analysis", icon: Sparkles },
  { label: "Requirements", path: "/requirements-list", icon: FolderKanban },
  { label: "Clarifications", path: "/clarifications", icon: MessageCircleQuestion },
  { label: "Issues", path: "/requirement-issues", icon: AlertCircle, badge: "5" },
  { label: "Reports", path: "/requirement-reports", icon: FileText },
  { label: "Intelligence", path: "/requirement-intelligence/analytics", icon: BarChart3 },
];

const projects = [

  { name: "Retail Banking App", customer: "FinBank", conversations: 8, problems: 4, confidence: 87, status: "In Progress", updated: "2h ago", tone: "blue" },
  { name: "E-Commerce Checkout", customer: "Northstar Market", conversations: 6, problems: 3, confidence: 81, status: "In Progress", updated: "Yesterday", tone: "violet" },
  { name: "Healthcare Appointment System", customer: "Wellnest", conversations: 11, problems: 7, confidence: 92, status: "Validated", updated: "3 days ago", tone: "mint" },
  { name: "Logistics Tracking Platform", customer: "ParcelPilot", conversations: 5, problems: 2, confidence: 74, status: "Needs discovery", updated: "5 days ago", tone: "amber" },
];

const analysisData = {
  goal: "The customer wants to transfer money quickly and independently without needing customer support.",
  stated: "The customer finds the money transfer process difficult and unreliable.",
  root: "Customers lack a simple and reliable way to complete money transfers independently.",
  rootExplanation: "The deeper issue appears to be reliability and confidence in completing the transfer independently, rather than simply the number of steps in the process.",
  evidence: [
    ["“I usually have to try multiple times.”", "Supports repeated failure and process friction."],
    ["“Sometimes I just call customer support.”", "Indicates the customer is unable to complete the task independently."],
  ],
  symptoms: ["Multiple failed attempts", "Repeated retries", "Long completion time", "Confusing navigation", "Customer support dependency"],
  questions: [
    ["Can you walk me through the last time you tried to transfer money?", "High", "Understand the actual customer journey."],
    ["Which step of the transfer process is most difficult for you?", "High", "Isolate the specific friction point."],
    ["What do you normally do when the transfer does not work?", "High", "Understand the current workaround."],
    ["How frequently does this happen?", "Medium", "Understand the scale of the problem."],
  ],
};

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">✦</span>
      <span>CLARIVON</span>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "dark" | "soft"; className?: string; type?: "button" | "submit"; disabled?: boolean }) {
  return <button type={type} disabled={disabled} className={`btn btn-${variant} ${className}`} onClick={onClick}>{children}</button>;
}

function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function ProgressBar({ value, color = "blue" }: { value: number; color?: string }) {
  return <div className="progress-track"><div className={`progress-fill progress-${color}`} style={{ width: `${value}%` }} /></div>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const timeout = window.setTimeout(onClose, 3200); return () => window.clearTimeout(timeout); }, [message, onClose]);
  return <div className="toast"><CheckCircle2 size={17} /><span>{message}</span><button onClick={onClose}><X size={15} /></button></div>;
}

function LandingPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="landing-page">
      <header className="landing-nav page-width">
        <Logo />
        <nav className="landing-links"><a href="#product">Product</a><a href="#how-it-works">How It Works</a><a href="#features">Features</a></nav>
        <div className="landing-actions"><Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button><Button onClick={() => navigate("/signup")}>Get Started <ArrowRight size={16} /></Button></div>
      </header>

      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> FROM CUSTOMER INSIGHT TO BUSINESS CLARITY</div>
            <h1>Understand the problem <em>before</em> you build the solution.</h1>
            <p className="hero-lede">CLARIVON uses AI to turn customer conversations into validated problems, clear requirements, and development-ready decisions.</p>
            <div className="hero-buttons"><Button onClick={() => navigate("/signup")}>Start customer discovery <ArrowRight size={17} /></Button><Button variant="secondary" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}><span className="play-icon">▶</span> See how it works</Button></div>
            <div className="hero-trust"><div className="avatar-stack"><span>JD</span><span>MK</span><span>RL</span><span>+</span></div><span>Trusted by product teams who refuse to guess.</span></div>
          </div>
          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="flow-card">
              <div className="flow-card-top"><span className="mini-label"><span className="status-live" /> CLARIVON AI</span><span className="flow-card-dots">•••</span></div>
              <div className="flow-card-header"><div><div className="small-kicker">ACTIVE ANALYSIS</div><h3>Retail Banking App</h3><p>FinBank · Conversation #08</p></div><div className="confidence-ring small"><strong>87</strong><span>%</span></div></div>
              <div className="flow-lane">
                {workflowSteps.map(([title, subtitle, Icon], index) => <div className={`flow-node ${index === 3 ? "active" : index > 3 ? "future" : ""}`} key={title}><div className="node-icon"><Icon size={15} /></div><div><b>{title}</b><small>{subtitle}</small></div>{index < workflowSteps.length - 1 && <div className="node-line" />}</div>)}
              </div>
              <div className="flow-insight"><div className="ai-avatar"><Sparkles size={15} /></div><div><strong>Root problem discovered</strong><p>Reliability is undermining customer confidence—not just the number of steps.</p></div><ArrowRight size={16} /></div>
            </div>
            <div className="floating-note floating-note-top"><div className="note-icon mint"><Check size={14} /></div><div><strong>Evidence extracted</strong><span>2 supporting statements</span></div></div>
            <div className="floating-note floating-note-bottom"><div className="note-icon violet"><MessageCircleQuestion size={14} /></div><div><strong>4 questions ready</strong><span>To close context gaps</span></div></div>
          </div>
        </section>

        <section className="marquee-strip"><div className="marquee-inner"><span>CONVERSATION</span><i>→</i><span>GOAL</span><i>→</i><span>ROOT PROBLEM</span><i>→</i><span>EVIDENCE</span><i>→</i><span>VALIDATION</span><i>→</i><span>CONVERSATION</span><i>→</i><span>GOAL</span></div></section>

        <section className="problem-section page-width" id="product">
          <div className="section-intro"><div className="eyebrow">THE PROBLEM WITH “JUST SUMMARIZE IT”</div><h2>Customer conversations rarely tell you the real problem.</h2><p>Customers describe symptoms, frustrations, and the solution they think they need. CLARIVON helps you look one layer deeper—before your roadmap becomes an expensive guess.</p></div>
          <div className="compare-grid"><div className="compare-card without"><div className="compare-title"><span className="compare-icon">×</span><span>Without CLARIVON</span></div><ul>{["Teams rely on assumptions", "Symptoms get mistaken for problems", "Important information gets missed", "Follow-up interviews are inconsistent", "Teams may build the wrong solution"].map(item => <li key={item}><span className="list-x">×</span>{item}</li>)}</ul></div><div className="compare-card with"><div className="compare-title"><span className="compare-icon"><Check size={15} /></span><span>With CLARIVON</span></div><ul>{["Understand customer goals", "Separate symptoms from root problems", "Identify assumptions and evidence", "Find missing information", "Generate intelligent follow-up questions", "Validate problem confidence"].map(item => <li key={item}><span className="list-check"><Check size={13} /></span>{item}</li>)}</ul></div></div>
        </section>

        <section className="how-section" id="how-it-works"><div className="page-width"><div className="section-intro centered"><div className="eyebrow">A BETTER WAY TO LISTEN</div><h2>From conversation to conviction.</h2><p>One connected workflow for moving from what customers say to what your team can confidently act on.</p></div><div className="steps-grid">{[["01", "Capture", "Bring in interviews, notes, emails, and research documents."], ["02", "Analyze", "AI identifies statements, patterns, problems, and assumptions."], ["03", "Discover", "Separate goals, symptoms, root problems, evidence, and gaps."], ["04", "Validate", "Ask better questions and measure how much you really know."]].map(([number, title, text]) => <div className="step-card" key={number}><span className="step-number">{number}</span><div className="step-art"><div className="step-art-line" /><div className="step-art-dot" /></div><h3>{title}</h3><p>{text}</p><a href="#features">Explore step <ArrowRight size={14} /></a></div>)}</div></div></section>

        <section className="features-section page-width" id="features"><div className="section-intro"><div className="eyebrow">BUILT FOR BETTER QUESTIONS</div><h2>The intelligence layer behind every good discovery conversation.</h2></div><div className="feature-grid">{[[Sparkles, "AI Conversation Analysis", "Go beyond a summary with structured reasoning."], [Target, "Customer Goal Detection", "Make the desired outcome explicit."], [Lightbulb, "Root Problem Discovery", "Challenge the obvious interpretation."], [AlertCircle, "Symptom Detection", "Separate signals from underlying causes."], [ShieldCheck, "Evidence Extraction", "See the exact statements that support a finding."], [MessageCircleQuestion, "AI Follow-Up Questions", "Turn context gaps into your next best question."], [Gauge, "Problem Confidence", "Know when to keep discovering—and when to act."], [FileText, "Discovery Reports", "Create a clear, shareable research record."]].map(([Icon, title, text]) => <div className="feature-card" key={title as string}><div className="feature-icon"><Icon size={19} /></div><h3>{title as string}</h3><p>{text as string}</p><ArrowRight className="feature-arrow" size={16} /></div>)}</div></section>

        <section className="cta-section page-width"><div className="cta-inner"><div className="cta-orbit orbit-one" /><div className="cta-orbit orbit-two" /><div className="eyebrow">MAKE THE NEXT DECISION WITH CLARITY</div><h2>Stop guessing what customers need.</h2><p>Start every product decision with a clearer understanding of the problem.</p><Button variant="dark" onClick={() => navigate("/signup")}>Start customer discovery <ArrowRight size={17} /></Button></div></section>
      </main>
      <footer className="landing-footer page-width"><Logo /><div className="footer-tagline" style={{fontSize: "0.85rem", color: "var(--muted)", margin: "0.5rem 0"}}>From Customer Insight to Business Clarity.</div><div className="footer-links"><a href="#product">Product</a><a href="#how-it-works">How It Works</a><a href="#features">Features</a><a href="mailto:hello@clarivon.ai">Contact</a><a href="#">Privacy</a><a href="#">Terms</a></div><span>© 2026 CLARIVON</span></footer>
    </div>
  );
}

function AuthPage({ mode, navigate }: { mode: "signin" | "signup"; navigate: (path: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  return <div className="auth-page"><div className="auth-poster"><div className="auth-poster-inner"><Logo light /><div className="auth-poster-copy"><div className="eyebrow light-eyebrow">CUSTOMER DISCOVERY INTELLIGENCE</div><h1>Discover the <em>real problem.</em></h1><p>Turn customer conversations into clear, evidence-backed problem insights.</p><div className="auth-flow"><span>Conversation</span><ArrowRight size={14} /><span>AI Analysis</span><ArrowRight size={14} /><span>Problem Discovery</span><ArrowRight size={14} /><span>Validation</span></div></div><div className="auth-poster-bottom"><span>✦</span><span>Understand the problem before you build the solution.</span></div></div></div><div className="auth-panel"><button className="auth-back" onClick={() => navigate("/")}><ArrowRight size={16} className="back-arrow" /> Back to home</button><div className="auth-card"><div className="auth-heading"><div className="auth-mark"><Sparkles size={17} /></div><h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2><p>{mode === "signin" ? "Pick up where you left off in your discovery work." : "Start turning conversations into conviction."}</p></div><form onSubmit={(e) => { e.preventDefault(); navigate("/dashboard"); }} className="auth-form">{mode === "signup" && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></label>}<label>Email<input type="email" placeholder="you@company.com" /></label><label>Password<div className="password-input"><input type={showPassword ? "text" : "password"} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>{mode === "signup" && <label>Role<select defaultValue="product"><option value="product">Product Manager</option><option value="founder">Founder</option><option value="designer">Designer</option><option value="researcher">Researcher</option><option value="analyst">Business Analyst</option></select></label>}{mode === "signin" && <div className="auth-options"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div>}<Button type="submit" className="full-width">{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={16} /></Button></form><div className="divider"><span>OR</span></div><Button variant="secondary" className="full-width google-btn" onClick={() => navigate("/dashboard")}><span className="google-g">G</span> Continue with Google</Button><p className="auth-switch">{mode === "signin" ? "Don't have an account?" : "Already have an account?"} <button onClick={() => navigate(mode === "signin" ? "/signup" : "/signin")}>{mode === "signin" ? "Create account" : "Sign in"}</button></p></div><p className="auth-legal">By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p></div></div>;
}


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

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || "CUSTOMER DISCOVERY"}</div><h2>{title}</h2><p>{subtitle}</p></div>{action && <div className="page-header-action">{action}</div>}</div>;
}

function StatCard({ label, value, delta, icon: Icon, accent }: { label: string; value: string; delta: string; icon: any; accent: string }) {
  return <div className="stat-card"><div className={`stat-icon ${accent}`}><Icon size={18} /></div><div className="stat-card-body"><span>{label}</span><strong>{value}</strong><small><TrendingUp size={12} /> {delta}</small></div><div className="stat-sparkline"><span style={{ height: "28%" }} /><span style={{ height: "45%" }} /><span style={{ height: "38%" }} /><span style={{ height: "72%" }} /><span style={{ height: "55%" }} /><span style={{ height: "88%" }} /></div></div>;
}

function WorkflowVisualization() {
  const stages = [["01", "Customer conversation", "Raw customer voice", "input"], ["02", "AI analysis", "Pattern recognition", "ai"], ["03", "Customer goal", "What they want", "goal"], ["04", "Stated problem", "What they say", "problem"], ["05", "Root problem", "What may be underneath", "root"], ["06", "Symptoms + assumptions", "Separate signal from cause", "signal"], ["07", "Evidence", "Build the case", "evidence"], ["08", "Missing information", "Find context gaps", "missing"], ["09", "Follow-up questions", "Ask what matters", "questions"], ["10", "Problem validation", "Know when to act", "validation"]];
  return <div className="workflow-visualization">{stages.map(([number, title, subtitle, tone], index) => <div className={`workflow-stage stage-${tone}`} key={title}><div className="stage-number">{number}</div><div className="stage-content"><strong>{title}</strong><span>{subtitle}</span></div>{index < stages.length - 1 && <ArrowDown className="stage-arrow" size={14} />}</div>)}</div>;
}


function DashboardPage({ navigate }: { navigate: (path: string) => void }) {
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await fetch("/api/metrics");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE DISCOVERY DASHBOARD"
        title="Good morning, John"
        subtitle="Discover the real problems behind your customer conversations."
        action={
          <Button onClick={() => navigate("/discovery")}>
            <Sparkles size={16} /> New analysis
          </Button>
        }
      />
      <div className="stats-grid">
        <StatCard label="Active projects" value={String(metrics?.projectCount ?? projectsList.length ?? 3)} delta="Real-time DB" icon={FolderKanban} accent="blue" />
        <StatCard label="Conversations analyzed" value={String(metrics?.conversationCount ?? 48)} delta="Extracted with AI" icon={MessageSquareText} accent="violet" />
        <StatCard label="Problems discovered" value={String(metrics?.problemCount ?? 36)} delta="Root insights" icon={Lightbulb} accent="amber" />
        <StatCard label="Questions generated" value={String(metrics?.questionCount ?? 124)} delta={`${metrics?.unansweredQuestions ?? 18} ready to ask`} icon={MessageCircleQuestion} accent="mint" />
      </div>
      <div className="dashboard-grid">
        <section className="surface-card workflow-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker"><span className="live-dot" /> YOUR DISCOVERY WORKFLOW</span>
              <h3>From conversation to conviction</h3>
              <p>Every analysis follows the same intelligence path—so nothing important gets skipped.</p>
            </div>
            <button className="more-button"><MoreHorizontal size={18} /></button>
          </div>
          <WorkflowVisualization />
          <div className="workflow-footer">
            <div>
              <span className="workflow-footer-dot" /> <strong>{projectsList.length} active projects</strong>
              <span>connected in workspace</span>
            </div>
            <button className="text-button" onClick={() => navigate("/discovery")}>
              Start a new analysis <ArrowRight size={14} />
            </button>
          </div>
        </section>
        <aside className="surface-card insight-card">
          <div className="insight-card-head">
            <div className="ai-orb"><Sparkles size={17} /></div>
            <span>CLARIVON AI</span>
            <span className="ai-status">Online</span>
          </div>
          <h3>What your workspace is telling you</h3>
          <div className="ai-callout">
            <div className="callout-number">01</div>
            <p>Transfer reliability appears in <strong>4 recent conversations</strong> across Retail Banking App.</p>
          </div>
          <div className="ai-callout">
            <div className="callout-number">02</div>
            <p>Problems with specific behavioral evidence are <strong>2.4× more confident</strong>.</p>
          </div>
          <button className="text-button" onClick={() => navigate("/intelligence")}>
            Explore intelligence <ArrowRight size={14} />
          </button>
        </aside>
      </div>
      <section className="dashboard-lower">
        <div className="surface-card projects-card">
          <div className="card-heading compact">
            <div>
              <span className="card-kicker">KEEP THE MOMENTUM</span>
              <h3>Recent projects</h3>
            </div>
            <button className="text-button" onClick={() => navigate("/projects")}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="projects-table">
            <div className="table-head">
              <span>Project</span>
              <span>Discovery health</span>
              <span>Status</span>
              <span>Updated</span>
              <span />
            </div>
            {projectsList.slice(0, 3).map((project: any) => (
              <button className="project-row" key={project.id || project.name} onClick={() => navigate("/projects")}>
                <div className="project-cell">
                  <div className={`project-logo ${project.tone || "blue"}`}>
                    {project.name.slice(0, 1)}
                  </div>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project.customer || "General"} · {project.conversation_count ?? 0} conversations</span>
                  </div>
                </div>
                <div className="health-cell">
                  <div>
                    <ProgressBar value={project.confidence_score ?? 80} color={project.tone === "mint" ? "mint" : project.tone === "violet" ? "violet" : "blue"} />
                    <strong>{project.confidence_score ?? 80}%</strong>
                  </div>
                  <span>{project.problem_count ?? 0} problems</span>
                </div>
                <Badge tone={project.status === "Validated" ? "mint" : "blue"}>{project.status}</Badge>
                <span className="updated-cell">{project.updated_at ? "Recently" : "Today"}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="surface-card quick-card">
          <div className="card-heading compact">
            <div>
              <span className="card-kicker">MOVE FASTER</span>
              <h3>Quick actions</h3>
            </div>
          </div>
          <button onClick={() => navigate("/projects")}>
            <span className="quick-icon blue"><Plus size={17} /></span>
            <span><strong>New project</strong><small>Organize a new research initiative</small></span>
            <ArrowRight size={15} />
          </button>
          <button onClick={() => navigate("/discovery")}>
            <span className="quick-icon violet"><Sparkles size={17} /></span>
            <span><strong>New analysis</strong><small>Analyze a customer conversation</small></span>
            <ArrowRight size={15} />
          </button>
          <button onClick={() => navigate("/discovery-requirements")}>
            <span className="quick-icon mint"><ArrowRight size={17} /></span>
            <span><strong>Discovery requirements</strong><small>Review active requirements</small></span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </>
  );
}


function NewProjectModal({
  isOpen,
  onClose,
  onSuccess,
  onToast
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProj: any) => void;
  onToast: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; customer?: string }>({});

  const createMutation = useMutation({
    mutationFn: async (newProj: { name: string; customer: string; description?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProj)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create project");
      }
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast(`Project "${data.name}" created successfully.`);
      onSuccess(data);
      setName("");
      setCustomer("");
      setDescription("");
      setErrors({});
      onClose();
    },
    onError: (err: any) => {
      onToast(`Error creating project: ${err?.message || "Server error"}`);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; customer?: string } = {};
    if (!name.trim()) newErrors.name = "Project name is required.";
    if (!customer.trim()) newErrors.customer = "Customer name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate({ name: name.trim(), customer: customer.trim(), description: description.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Project Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Mobile Banking Refresh"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                Customer / Client Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.customer ? "error" : ""}`}
                placeholder="e.g. FinBank Global"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (errors.customer) setErrors((prev) => ({ ...prev, customer: undefined }));
                }}
              />
              {errors.customer && <span className="form-error-msg">{errors.customer}</span>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe the project scope or research goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AIAssistantSidebar({
  projectId,
  currentStep,
  analysisResult
}: {
  projectId: number;
  currentStep: number;
  analysisResult: any;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ai-guidance", projectId, currentStep, Boolean(analysisResult)],
    queryFn: async () => {
      const res = await fetch("/api/ai-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          step: currentStep,
          analysisResult
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load AI guidance");
      return json.data;
    },
    staleTime: 20000
  });

  return (
    <div className="side-ai surface-card">
      <div className="insight-card-head">
        <div className="ai-orb">
          <Sparkles size={15} />
        </div>
        <span>AI ASSISTANT</span>
      </div>

      {isLoading ? (
        <div className="ai-guidance-skeleton">
          <div className="skeleton-line" style={{ width: "95%" }} />
          <div className="skeleton-line" style={{ width: "80%" }} />
          <div className="skeleton-line" style={{ width: "65%" }} />
        </div>
      ) : isError ? (
        <div className="ai-guidance-error">
          <span>{(error as any)?.message || "Guidance error"}</span>
          <Button variant="ghost" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !data?.guidance ? (
        <div className="ai-guidance-empty">No guidance available for this step.</div>
      ) : (
        <>
          <p>“{data.guidance}”</p>
          <span className="ai-sig">— CLARIVON AI</span>
        </>
      )}
    </div>
  );
}

function DiscoveryPage({ onToast }: { onToast: (message: string) => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Conversation");
  const [tabInputs, setTabInputs] = useState<Record<string, string>>({
    Conversation: "I spend too much time trying to transfer money through the mobile app. I usually have to try multiple times, and sometimes I just call customer support.",
    "Interview Notes": "Interviewer: What issue did you run into during transfer?\nUser: Every time I enter recipient details and click Send, it spins for 30 seconds and fails with a generic error.",
    Email: "From: customer@finbank.com\nSubject: Issues with recurring transfer setup\nHi Team,\nWe tried setting up automated weekly transfers for our vendor account, but the system keeps throwing Error 502 without saving the scheduled date. Can you fix this urgently?",
    "Meeting Notes": "Meeting Title: Weekly Operations Review\nDate: Sept 10\nKey takeaway: Customers are reporting delays in confirmation emails after completing checkout. Support volume is up 25% due to double payments.",
    "Upload Document": ""
  });

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    text: string;
    wordCount: number;
    status: "idle" | "uploading" | "success" | "error";
    errorMessage?: string;
    progress: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "results">("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [questionCopied, setQuestionCopied] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real projects from DB
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch projects");
      return json.data || [];
    }
  });

  // Set default selected project
  useEffect(() => {
    if (!selectedProjectId && projectsList.length > 0) {
      setSelectedProjectId(projectsList[0].id);
    }
  }, [projectsList, selectedProjectId]);

  const activeProject = useMemo(() => {
    return projectsList.find((p: any) => p.id === selectedProjectId) || projectsList[0];
  }, [projectsList, selectedProjectId]);

  // Fetch active analysis for selected project
  const { data: activeAnalysis } = useQuery({
    queryKey: ["activeAnalysis", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const res = await fetch(`/api/analyses/active?projectId=${selectedProjectId}`);
      const json = await res.json();
      return json.data || null;
    },
    enabled: Boolean(selectedProjectId)
  });

  // Sync state with active analysis from DB
  useEffect(() => {
    if (activeAnalysis) {
      if (activeAnalysis.current_step) {
        setCurrentStep(activeAnalysis.current_step);
      }
      if (activeAnalysis.analysis_result) {
        setAnalysisResult(activeAnalysis.analysis_result);
        setStatus("results");
        setSaved(true);
      } else {
        setAnalysisResult(null);
        setStatus("idle");
        setSaved(false);
      }
    }
  }, [activeAnalysis]);

  // Mutation to save step change to DB
  const updateStepMutation = useMutation({
    mutationFn: async (step: number) => {
      if (!selectedProjectId) return;
      await fetch("/api/analyses/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, step })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAnalysis", selectedProjectId] });
    }
  });

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    if (selectedProjectId) {
      updateStepMutation.mutate(step);
    }
  };

  const processFile = async (file: File) => {
    const allowedExts = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExts.includes(ext)) {
      const errorMsg = `Unsupported file format "${ext}". Please upload PDF, DOCX, or TXT.`;
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      const errorMsg = "File size exceeds 20MB limit.";
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      text: "",
      wordCount: 0,
      status: "uploading",
      progress: 30
    });

    try {
      if (ext === ".txt") {
        const text = await file.text();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        setUploadedFile({
          name: file.name,
          size: file.size,
          text,
          wordCount,
          status: "success",
          progress: 100
        });
        setTabInputs((prev) => ({ ...prev, "Upload Document": text }));
        onToast(`Extracted ${wordCount} words from ${file.name}`);
      } else {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.split(",")[1] || res;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setUploadedFile((prev) => (prev ? { ...prev, progress: 65 } : null));

        const resp = await fetch("/api/extract-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data,
            fileName: file.name,
            mimeType: file.type
          })
        });

        const json = await resp.json();
        if (!json.success) {
          throw new Error(json.error || "Failed to extract document content.");
        }

        setUploadedFile({
          name: file.name,
          size: file.size,
          text: json.text,
          wordCount: json.wordCount,
          status: "success",
          progress: 100
        });
        setTabInputs((prev) => ({ ...prev, "Upload Document": json.text }));
        onToast(`Extracted ${json.wordCount} words from ${file.name}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to process document.";
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
    }
  };

  const analyze = async () => {
    let contentToAnalyze = "";
    if (tab === "Upload Document") {
      contentToAnalyze = uploadedFile?.text || "";
    } else {
      contentToAnalyze = tabInputs[tab] || "";
    }

    if (!contentToAnalyze.trim()) {
      if (tab === "Upload Document") {
        onToast("Please upload a PDF, DOCX, or TXT document first.");
      } else {
        onToast(`Please enter ${tab.toLowerCase()} text before analyzing.`);
      }
      return;
    }

    setStatus("loading");

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: tab,
          content: contentToAnalyze,
          fileName: tab === "Upload Document" ? uploadedFile?.name : undefined
        })
      });

      const json = await resp.json();
      if (!json.success) {
        throw new Error(json.error || "AI analysis server error.");
      }

      const resultData = json.data;
      setAnalysisResult(resultData);
      setStatus("results");

      // Save analysis to SQLite DB under selected project
      if (selectedProjectId) {
        await fetch("/api/analyses/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProjectId,
            inputType: tab,
            rawInput: contentToAnalyze,
            result: resultData,
            currentStep: 2
          })
        });
        setSaved(true);
        setCurrentStep(2);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["activeAnalysis", selectedProjectId] });
      }
    } catch (err: any) {
      setStatus("idle");
      onToast(`Analysis error: ${err?.message || "Could not connect to analysis service."}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="analysis-loading">
        <div className="analysis-loading-orb">
          <Sparkles size={28} />
        </div>
        <div className="eyebrow">CLARIVON AI · LIVE ANALYSIS</div>
        <h2>Listening for what’s underneath.</h2>
        <p>We’re moving from the customer’s words to a clearer understanding of the problem.</p>
        <div className="loading-steps">
          {[
            "Reading customer statements",
            "Identifying customer goals",
            "Detecting stated problems",
            "Separating symptoms from root causes",
            "Detecting assumptions & evidence",
            "Finding missing context & conflicts",
            "Extracting requirements"
          ].map((step, index) => (
            <div className={`loading-step ${index < 5 ? "done" : index === 5 ? "current" : ""}`} key={step}>
              <span>{index < 5 ? <Check size={13} /> : index === 5 ? <span className="loading-pulse" /> : <Circle size={12} />}</span>
              {step}
              {index < 5 && <small>complete</small>}
            </div>
          ))}
        </div>
        <div className="loading-progress">
          <ProgressBar value={82} color="violet" />
          <span>Almost done · finalizing structured intelligence report</span>
        </div>
      </div>
    );
  }

  if (status === "results" && analysisResult && currentStep > 1) {
    return (
      <AnalysisResults
        data={analysisResult}
        rawInput={tab === "Upload Document" ? uploadedFile?.text || "" : tabInputs[tab] || ""}
        saved={saved}
        setSaved={setSaved}
        questionCopied={questionCopied}
        setQuestionCopied={setQuestionCopied}
        onToast={onToast}
        onReset={() => {
          setStatus("idle");
          setCurrentStep(1);
          if (selectedProjectId) {
            updateStepMutation.mutate(1);
          }
        }}
      />
    );
  }

  const currentLength = (tab === "Upload Document" ? uploadedFile?.text.length : tabInputs[tab]?.length) || 0;

  const placeholders: Record<string, string> = {
    Conversation: "Paste the customer conversation transcript here (e.g. Customer: I tried sending $500 to my account... Agent: What happened next?)...",
    "Interview Notes": "Paste structured interview notes here (e.g. Participant #4: Struggles with multi-factor authentication delays during high load)...",
    Email: "Paste customer email, support message, or feedback ticket here...",
    "Meeting Notes": "Paste meeting minutes, call transcripts, or team sync notes here..."
  };

  const stepTitles: Record<number, string> = {
    1: "Capture conversation",
    2: "Analyze signals",
    3: "Discover root problem",
    4: "Validate questions"
  };

  return (
    <>
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={(newProj) => {
          setSelectedProjectId(newProj.id);
        }}
        onToast={onToast}
      />

      <PageHeader
        eyebrow={`NEW ANALYSIS · ${(activeProject?.name || "RETAIL BANKING APP").toUpperCase()}`}
        title="New customer discovery analysis"
        subtitle="Analyze a customer conversation and uncover the problem behind what they said."
        action={
          <div className="analysis-progress-pill">
            <span>STEP 0{currentStep}</span>
            <strong>{stepTitles[currentStep] || "Capture conversation"}</strong>
            <span>of 04</span>
          </div>
        }
      />
      <div className="analysis-layout">
        <main>
          <div className="surface-card project-picker">
            <div className="card-heading compact">
              <div>
                <span className="card-kicker">PROJECT</span>
                <h3>Where should we save this analysis?</h3>
              </div>
              <Button variant="secondary" onClick={() => setIsNewProjectModalOpen(true)}>
                <Plus size={15} /> New project
              </Button>
            </div>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <select
                className="form-select"
                style={{ fontSize: "14px", fontWeight: "600", padding: "12px 14px", borderRadius: "12px" }}
                value={selectedProjectId || ""}
                onChange={(e) => {
                  if (e.target.value === "__NEW__") {
                    setIsNewProjectModalOpen(true);
                  } else {
                    setSelectedProjectId(Number(e.target.value));
                  }
                }}
              >
                {projectsList.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.customer || "General"}) — {p.conversation_count || 0} conversation{p.conversation_count === 1 ? "" : "s"}
                  </option>
                ))}
                <option value="__NEW__">+ Create New Project...</option>
              </select>
            </div>
          </div>

          <div className="surface-card conversation-card">
            <div className="card-heading">
              <div>
                <span className="card-kicker">CAPTURE CUSTOMER VOICE</span>
                <h3>What did the customer say?</h3>
                <p>Start with their words. CLARIVON will help you separate the signal from the noise.</p>
              </div>
              <div className="conversation-count">
                {currentLength}
                <span>/ 10,000</span>
              </div>
            </div>

            <div className="analysis-tabs">
              {["Conversation", "Interview Notes", "Email", "Meeting Notes", "Upload Document"].map((item) => (
                <button
                  key={item}
                  className={tab === item ? "active" : ""}
                  onClick={() => setTab(item)}
                >
                  {item === "Upload Document" && <Upload size={14} />}
                  {item}
                </button>
              ))}
            </div>

            {tab === "Upload Document" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                  }}
                />

                {!uploadedFile ? (
                  <div
                    className={`upload-zone ${isDragging ? "dragging" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <div className="upload-icon">
                      <Upload size={22} />
                    </div>
                    <strong>Drop a document here</strong>
                    <span>PDF, DOCX, or TXT · up to 20 MB</span>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Choose file
                    </Button>
                  </div>
                ) : (
                  <div className="uploaded-file-card">
                    <div className="uploaded-file-head">
                      <div className="uploaded-file-info">
                        <FileText size={22} className="file-icon" />
                        <div>
                          <strong>{uploadedFile.name}</strong>
                          <span>
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · {uploadedFile.wordCount ? `${uploadedFile.wordCount} words` : "Processing"}
                          </span>
                        </div>
                      </div>
                      <div className="uploaded-file-actions">
                        <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
                          Replace
                        </Button>
                        <Button
                          variant="ghost"
                          className="danger-text"
                          onClick={() => {
                            setUploadedFile(null);
                            setTabInputs((prev) => ({ ...prev, "Upload Document": "" }));
                          }}
                        >
                          <Trash2 size={15} /> Remove
                        </Button>
                      </div>
                    </div>

                    {uploadedFile.status === "uploading" && (
                      <div className="upload-progress-wrap">
                        <ProgressBar value={uploadedFile.progress} color="blue" />
                        <span>Extracting document text... {uploadedFile.progress}%</span>
                      </div>
                    )}

                    {uploadedFile.status === "error" && (
                      <div className="upload-error-banner">
                        <AlertCircle size={16} />
                        <span>{uploadedFile.errorMessage || "Document parsing failed."}</span>
                      </div>
                    )}

                    {uploadedFile.status === "success" && (
                      <div className="document-preview-box">
                        <div className="preview-label">EXTRACTED CONTENT PREVIEW</div>
                        <div className="preview-content">{uploadedFile.text}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={tabInputs[tab] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setTabInputs((prev) => ({ ...prev, [tab]: val }));
                }}
                placeholder={placeholders[tab] || "Paste customer input here..."}
              />
            )}

            <div className="conversation-footer">
              <div>
                <span className="input-tip">
                  <Lightbulb size={14} /> Tip
                </span>
                Include the customer’s exact words for stronger evidence.
              </div>
              <Button onClick={analyze}>
                <Sparkles size={16} /> Analyze with AI
              </Button>
            </div>
          </div>

          <div className="analysis-note">
            <Sparkles size={16} />
            <div>
              <strong>This is more than summarization.</strong>
              <p>CLARIVON will identify goals, stated and root problems, symptoms, assumptions, evidence, missing context, conflicts, requirements, and follow-up questions.</p>
            </div>
          </div>
        </main>

        <aside className="analysis-side">
          <div className="side-progress surface-card">
            <div className="side-progress-head">
              <strong>Discovery flow</strong>
              <span>{currentStep} of 4</span>
            </div>
            <ProgressBar value={currentStep * 25} color="blue" />
            <div className="mini-flow">
              <div
                className={`mini-flow-item ${currentStep >= 1 ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleStepClick(1)}
              >
                <span>{currentStep > 1 ? <Check size={12} /> : "1"}</span>
                <div>
                  <strong>Capture</strong>
                  <small>Add customer voice</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 2 ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleStepClick(2)}
              >
                <span>{currentStep > 2 ? <Check size={12} /> : "2"}</span>
                <div>
                  <strong>Analyze</strong>
                  <small>Find patterns and signals</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 3 ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleStepClick(3)}
              >
                <span>{currentStep > 3 ? <Check size={12} /> : "3"}</span>
                <div>
                  <strong>Discover</strong>
                  <small>Move below the surface</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 4 ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => handleStepClick(4)}
              >
                <span>{currentStep >= 4 ? <Check size={12} /> : "4"}</span>
                <div>
                  <strong>Validate</strong>
                  <small>Know what to ask next</small>
                </div>
              </div>
            </div>
          </div>

          <AIAssistantSidebar
            projectId={selectedProjectId || 1}
            currentStep={currentStep}
            analysisResult={analysisResult}
          />
        </aside>
      </div>
    </>
  );
}

function ConfidenceRing({ value, label }: { value: number; label?: string }) {
  return <div className="confidence-wrap"><div className="confidence-ring"><div><strong>{value}</strong><span>%</span></div></div>{label && <span>{label}</span>}</div>;
}

function AnalysisResults({
  data,
  rawInput,
  saved,
  setSaved,
  questionCopied,
  setQuestionCopied,
  onToast,
  onReset,
}: {
  data: any;
  rawInput: string;
  saved: boolean;
  setSaved: (v: boolean) => void;
  questionCopied: boolean;
  setQuestionCopied: (v: boolean) => void;
  onToast: (message: string) => void;
  onReset: () => void;
}) {
  const copyQuestions = () => {
    if (data?.questions) {
      navigator.clipboard?.writeText(data.questions.map((q: any, i: number) => `${i + 1}. ${q[0]}`).join("\n"));
      setQuestionCopied(true);
      onToast("Questions copied to clipboard.");
    }
  };

  const validation = data?.validation || {
    confidence: 87,
    evidenceScore: 92,
    clarityScore: 85,
    completenessScore: 78,
    summary: "Strong customer evidence detected."
  };

  return (
    <div className="results-page">
      <div className="results-top">
        <div>
          <div className="eyebrow">ANALYSIS COMPLETE · {data?.inputType?.toUpperCase() || "CUSTOMER VOICE"}</div>
          <h2>Here’s what we heard.</h2>
          <p>CLARIVON looked beyond the literal wording to map goals, problems, root causes, evidence, conflicts, requirements, and next best questions.</p>
        </div>
        <div className="results-actions">
          <Button variant="secondary" onClick={onReset}>
            <Pencil size={15} /> Edit input
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.history.pushState({}, "", "/requirement-analysis?from=discovery");
              window.dispatchEvent(new PopStateEvent("popstate"));
              onToast("Customer discovery findings are ready for requirement analysis.");
            }}
          >
            <Workflow size={15} /> Convert findings
          </Button>
          <Button onClick={() => { setSaved(true); onToast("Discovery saved successfully."); }}>
            {saved ? <Check size={15} /> : <Download size={15} />} {saved ? "Saved" : "Save discovery"}
          </Button>
        </div>
      </div>

      <div className="results-meta">
        <span><span className="live-dot" /> AI analysis complete</span>
        <span>Retail Banking App</span>
        <span>{data?.fileName ? `File: ${data.fileName}` : `${data?.inputType || "Customer Voice"} #09`}</span>
        <span>Analyzed just now</span>
      </div>

      <div className="results-grid">
        <div className="results-main">
          {/* 01: Customer Goal */}
          <section className="result-block accent-blue">
            <div className="result-label">
              <span className="result-num">01</span>
              <div>
                <span className="card-kicker">CUSTOMER GOAL</span>
                <h3>What does the customer want?</h3>
              </div>
              <Badge tone="mint">{validation.confidence}% confidence</Badge>
            </div>
            <p className="result-lead">{data?.goal}</p>
            <div className="result-source">
              <MessageSquareText size={15} />
              <span>Inferred from customer statements in {data?.inputType || "input"}.</span>
            </div>
          </section>

          {/* 02: Stated Problem */}
          <section className="result-block accent-amber">
            <div className="result-label">
              <span className="result-num">02</span>
              <div>
                <span className="card-kicker">STATED PROBLEM</span>
                <h3>What are they saying is wrong?</h3>
              </div>
            </div>
            <p className="result-lead">{data?.stated}</p>
            {data?.evidence?.[0] && (
              <div className="evidence-highlight">
                <span>{data.evidence[0][0]}</span>
                <small>Direct customer statement</small>
              </div>
            )}
          </section>

          {/* 03: Root Problem */}
          <section className="result-block accent-violet root-problem-block">
            <div className="result-label">
              <span className="result-num">03</span>
              <div>
                <span className="card-kicker">ROOT PROBLEM · AI REASONING</span>
                <h3>What may be underneath?</h3>
              </div>
              <ConfidenceRing value={validation.confidence} label="confidence" />
            </div>
            <p className="result-lead">{data?.root}</p>
            <div className="reasoning-box">
              <div className="reasoning-icon"><Lightbulb size={16} /></div>
              <div>
                <strong>Why this is deeper than the stated problem</strong>
                <p>{data?.rootExplanation}</p>
              </div>
            </div>
          </section>

          {/* 04: Symptoms Detected */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">04</span>
              <div>
                <span className="card-kicker">SYMPTOMS DETECTED</span>
                <h3>Signals showing up in the input</h3>
              </div>
              <Badge tone="violet">{data?.symptoms?.length || 0} detected</Badge>
            </div>
            <div className="symptoms-grid">
              {(data?.symptoms || []).map((symptom: string, i: number) => (
                <div className="symptom-chip" key={symptom}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{symptom}</strong>
                  <small>{i < 2 ? "High signal" : "Supporting signal"}</small>
                </div>
              ))}
            </div>
          </section>

          {/* 05: Assumptions Detected */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">05</span>
              <div>
                <span className="card-kicker">ASSUMPTIONS DETECTED</span>
                <h3>What might we be assuming?</h3>
              </div>
              <Badge tone="amber">Unconfirmed</Badge>
            </div>
            {(data?.assumptions || []).map((item: any, idx: number) => (
              <div className="assumption-card" key={idx} style={{ marginBottom: "10px" }}>
                <div className="assumption-icon"><HelpCircle size={18} /></div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </section>

          {/* 06: Evidence */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">06</span>
              <div>
                <span className="card-kicker">EVIDENCE</span>
                <h3>What supports these findings?</h3>
              </div>
            </div>
            <div className="evidence-list">
              {(data?.evidence || []).map(([quote, interpretation]: [string, string]) => (
                <div className="evidence-row" key={quote}>
                  <div className="evidence-quote">
                    <span>CUSTOMER STATEMENT</span>
                    <p>{quote}</p>
                  </div>
                  <ArrowRight size={17} />
                  <div className="evidence-interpretation">
                    <span>AI INTERPRETATION</span>
                    <p>{interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 07: Missing Information */}
          <section className="result-block missing-block">
            <div className="result-label">
              <span className="result-num">07</span>
              <div>
                <span className="card-kicker">MISSING INFORMATION</span>
                <h3>What do we still need to know?</h3>
              </div>
              <Badge tone="rose">{data?.missing?.length || 0} context gaps</Badge>
            </div>
            <div className="missing-grid">
              {(data?.missing || []).map(([title, desc, priority]: [string, string, string]) => (
                <div className="missing-card" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <Badge tone={priority === "High" ? "rose" : "amber"}>{priority} priority</Badge>
                  </div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 08: Conflicts & Contradictions Detected */}
          <section className="result-block conflict-block">
            <div className="result-label">
              <span className="result-num">08</span>
              <div>
                <span className="card-kicker">CONFLICTS & CONTRADICTIONS</span>
                <h3>Trade-offs and opposing requirements</h3>
              </div>
              <Badge tone="rose">{data?.conflicts?.length || 0} identified</Badge>
            </div>
            <div className="conflicts-grid">
              {(data?.conflicts || []).map(([topic, description, impact]: [string, string, string]) => (
                <div className="conflict-card" key={topic}>
                  <div className="conflict-icon"><AlertCircle size={18} /></div>
                  <div className="conflict-body">
                    <strong>{topic}</strong>
                    <p>{description}</p>
                    <Badge tone={impact === "High" ? "rose" : "amber"}>{impact} impact</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 09: Extracted Actionable Requirements */}
          <section className="result-block acceptance-block">
            <div className="result-label">
              <span className="result-num">09</span>
              <div>
                <span className="card-kicker">EXTRACTED REQUIREMENTS</span>
                <h3>Actionable requirements derived from input</h3>
              </div>
              <Badge tone="mint">{data?.requirements?.length || 0} requirements</Badge>
            </div>
            <div className="requirements-grid">
              {(data?.requirements || []).map(([title, desc, priority, category]: [string, string, string, string]) => (
                <div className="requirement-result-card" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                  <div className="requirement-result-tags">
                    <Badge tone={category === "Functional" ? "blue" : "violet"}>{category}</Badge>
                    <Badge tone={priority === "High" ? "rose" : "amber"}>{priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10: AI Follow-Up Questions */}
          <section className="result-block questions-block">
            <div className="result-label">
              <span className="result-num">10</span>
              <div>
                <span className="card-kicker">AI FOLLOW-UP QUESTIONS</span>
                <h3>Ask what matters next</h3>
              </div>
              <div className="question-actions">
                <Button variant="secondary" onClick={copyQuestions}>
                  {questionCopied ? <Check size={14} /> : <Copy size={14} />} {questionCopied ? "Copied" : "Copy questions"}
                </Button>
                <Button variant="ghost" onClick={() => onToast("Question added to your discovery list.")}>
                  <Plus size={14} /> Add question
                </Button>
              </div>
            </div>
            <p className="section-supporting">CLARIVON identified information that is still missing. Ask these questions in your next customer conversation.</p>
            <div className="question-list">
              {(data?.questions || []).map(([question, priority, purpose]: [string, string, string], i: number) => (
                <div className="question-row" key={question}>
                  <span className="question-number">0{i + 1}</span>
                  <div className="question-copy">
                    <strong>{question}</strong>
                    <span>{purpose}</span>
                  </div>
                  <Badge tone={priority === "High" ? "rose" : "amber"}>{priority}</Badge>
                  <button onClick={() => { navigator.clipboard?.writeText(question); onToast("Question copied."); }}>
                    <Copy size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="results-side">
          <div className="surface-card validation-card">
            <div className="card-kicker">PROBLEM VALIDATION</div>
            <h3>Do we understand enough to act?</h3>
            <div className="validation-rings">
              <ConfidenceRing value={validation.confidence} label="Problem confidence" />
              <ConfidenceRing value={validation.evidenceScore} label="Customer evidence" />
              <ConfidenceRing value={validation.clarityScore} label="Problem clarity" />
            </div>
            <div className="validation-stat">
              <div><span>Context completeness</span><strong>{validation.completenessScore}%</strong></div>
              <ProgressBar value={validation.completenessScore} color="blue" />
            </div>
            <div className="validation-stat">
              <div><span>Validation needed</span><strong>{100 - validation.completenessScore}%</strong></div>
              <ProgressBar value={100 - validation.completenessScore} color="amber" />
            </div>
            <div className="validation-summary">
              <ShieldCheck size={16} />
              <p>{validation.summary}</p>
            </div>
          </div>

          <div className="surface-card assistant-card">
            <div className="insight-card-head">
              <div className="ai-orb"><Sparkles size={15} /></div>
              <span>CLARIVON AI</span>
            </div>
            <h3>One thing to carry forward</h3>
            <p>“Ask about the last failed transfer—not the average experience. Specific moments reveal the journey.”</p>
            <button className="text-button" onClick={() => onToast("Follow-up prompt saved to your questions.")}>
              Save as prompt <ArrowRight size={14} />
            </button>
          </div>

          <div className="surface-card source-card">
            <div className="card-kicker">SOURCE {data?.inputType?.toUpperCase() || "INPUT"}</div>
            <div className="source-quote">“{rawInput}”</div>
            <button className="text-button" onClick={onReset}>
              Edit source <Pencil size={14} />
            </button>
          </div>
        </aside>
      </div>

      <section className="surface-card discovery-summary">
        <div className="summary-header">
          <div>
            <div className="card-kicker">READY TO SHARE</div>
            <h3>Customer discovery summary</h3>
            <p>{data?.inputType} Analysis · FinBank Customer</p>
          </div>
          <Button variant="secondary" onClick={() => onToast("Share dialog opened.")}>
            <Share2 size={15} /> Share discovery
          </Button>
        </div>
        <div className="summary-grid">
          <div>
            <span>Customer goal</span>
            <strong>{data?.goal}</strong>
          </div>
          <div>
            <span>Root problem</span>
            <strong>{data?.root}</strong>
          </div>
          <div>
            <span>Recommended next step</span>
            <strong>Conduct a follow-up interview focused on the primary friction point.</strong>
          </div>
        </div>
      </section>
    </div>
  );
}


function ProjectsPage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Updated");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch projects");
      return json.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast("Project deleted.");
      setMenuOpenId(null);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/projects/${id}/archive`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast("Project archived.");
      setMenuOpenId(null);
    }
  });

  let filtered = projectsList.filter((p: any) =>
    `${p.name} ${p.customer || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterStatus !== "All") {
    filtered = filtered.filter((p: any) => p.status === filterStatus);
  }

  filtered.sort((a: any, b: any) => {
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    if (sortBy === "Conversations") return (b.conversation_count ?? b.conversations ?? 0) - (a.conversation_count ?? a.conversations ?? 0);
    if (sortBy === "Problems") return (b.problem_count ?? b.problems ?? 0) - (a.problem_count ?? a.problems ?? 0);
    if (sortBy === "Confidence") return (b.confidence_score ?? b.confidence ?? 0) - (a.confidence_score ?? a.confidence ?? 0);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); // Updated
  });

  return (
    <>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        onToast={onToast}
      />
      <PageHeader
        eyebrow="CUSTOMER DISCOVERY · WORKSPACE"
        title="Projects"
        subtitle="Organize customer discovery work across products, customers, and research initiatives."
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New project
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search projects"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="btn btn-secondary">
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Validated">Validated</option>
          <option value="Needs discovery">Needs discovery</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="btn btn-secondary">
          <option value="Updated">Sort by: Updated</option>
          <option value="Name">Sort by: Name</option>
          <option value="Conversations">Sort by: Conversations</option>
          <option value="Problems">Sort by: Problems</option>
          <option value="Confidence">Sort by: Confidence</option>
        </select>
      </div>
      
      {projectsList.length === 0 ? (
        <div className="surface-card" style={{ padding: '3rem', textAlign: 'center' }}>
           <FolderKanban size={32} style={{ opacity: 0.5, marginBottom: '1rem', display: 'inline-block' }} />
           <h3>No projects yet</h3>
           <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create a project to start organizing your discovery work.</p>
           <Button onClick={() => setIsModalOpen(true)}>Create a new project</Button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project: any) => (
            <div className="project-card surface-card" key={project.id || project.name} style={{ position: 'relative' }}>
              <div className="project-card-top">
                <div className={`project-logo large ${project.tone || "blue"}`}>
                  {project.name.slice(0, 1)}
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}>
                    <MoreHorizontal size={18} />
                  </button>
                  {menuOpenId === project.id && (
                    <div style={{ position: 'absolute', right: 0, top: '24px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '150px', padding: '4px' }}>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => { setMenuOpenId(null); onToast("Edit not implemented in demo"); }}>
                         <Pencil size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Edit
                      </button>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => archiveMutation.mutate(project.id)}>
                         <FolderKanban size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Archive
                      </button>
                      <button className="nav-item" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rose)' }} onClick={() => { if(window.confirm('Are you sure you want to delete this project?')) deleteMutation.mutate(project.id); }}>
                         <Trash2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3>{project.name}</h3>
              <p className="project-customer">
                <Building2 size={14} /> {project.customer || "General"}
              </p>
              <div className="project-card-stats">
                <div>
                  <span>Conversations</span>
                  <strong>{project.conversation_count ?? project.conversations ?? 0}</strong>
                </div>
                <div>
                  <span>Problems</span>
                  <strong>{project.problem_count ?? project.problems ?? 0}</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{project.confidence_score ?? project.confidence ?? 80}%</strong>
                </div>
              </div>
              <div className="project-card-bottom">
                <Badge tone={project.status === "Validated" ? "mint" : project.status === "Needs discovery" ? "amber" : "blue"}>
                  {project.status || "In Progress"}
                </Badge>
                <span>Updated {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : (project.updated || "Recently")}</span>
              </div>
              <Button variant="secondary" className="full-width" onClick={() => navigate("/discovery")}>
                Open project <ArrowRight size={15} />
              </Button>
            </div>
          ))}
          <button className="new-project-card" onClick={() => setIsModalOpen(true)}>
            <span>
              <Plus size={19} />
            </span>
            <strong>Create a new project</strong>
            <small>Start a focused discovery workspace</small>
          </button>
        </div>
      )}
    </>
  );
}

function SlidersHorizontalIcon() { return <span className="sliders-icon"><span /><span /><span /></span>; }


function ProjectDetailPage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  return <><button className="back-link" onClick={() => navigate("/projects")}><ArrowRight size={15} className="back-arrow" /> Back to projects</button><div className="project-detail-head"><div><div className="eyebrow">PROJECT · ACTIVE DISCOVERY</div><h2>Retail Banking App</h2><p>Helping FinBank customers transfer money with confidence.</p><div className="detail-meta"><span><Building2 size={14} /> FinBank</span><span><Clock3 size={14} /> Started Aug 12, 2026</span><span><Clock3 size={14} /> Updated 2 hours ago</span></div></div><div className="detail-actions"><Button variant="secondary" onClick={() => onToast("Project settings opened.")}><Settings size={15} /> Project settings</Button><Button onClick={() => navigate("/discovery")}><Sparkles size={15} /> New analysis</Button></div></div><div className="detail-stats"><div><span>Conversations</span><strong>8</strong><small>+2 this week</small></div><div><span>Problems discovered</span><strong>4</strong><small>3 high confidence</small></div><div><span>Questions generated</span><strong>22</strong><small>5 unanswered</small></div><div><span>Discovery confidence</span><strong>87%</strong><small>↑ 12% this month</small></div></div><section className="surface-card conversation-list"><div className="card-heading compact"><div><span className="card-kicker">RESEARCH LOG</span><h3>Customer conversations</h3></div><Button variant="secondary" onClick={() => navigate("/discovery")}><Plus size={15} /> Add conversation</Button></div><div className="conversation-list-head"><span>Conversation</span><span>Date</span><span>Status</span><span>Confidence</span><span /></div>{[["Mobile transfer friction", "FinBank customer #08", "Today", "Analyzed", "87%"], ["Card activation journey", "FinBank customer #07", "Sep 06, 2026", "Analyzed", "91%"], ["Receiving a payment", "FinBank customer #06", "Sep 02, 2026", "Analyzed", "82%"], ["International transfer", "FinBank customer #05", "Aug 28, 2026", "Needs review", "64%"]].map(row => <button className="conversation-row" key={row[0]} onClick={() => navigate("/discovery")}><div className="conversation-title"><div className="conversation-row-icon"><MessageSquareText size={15} /></div><div><strong>{row[0]}</strong><span>{row[1]}</span></div></div><span>{row[2]}</span><Badge tone={row[3] === "Analyzed" ? "mint" : "amber"}>{row[3]}</Badge><strong className="confidence-text">{row[4]}</strong><ChevronRight size={16} /></button>)}</section></>;
}


function RequirementsPage({ onToast }: { onToast: (message: string) => void }) {
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });
  const projectId = projectsList[0]?.id || 6; // Defaulting to 1, could be read from context/URL in real app
  const queryClient = useQueryClient();

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/requirements?projectId=${projectId}`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: "New discovery requirement",
          category: "Customer context",
          status: "Missing",
          priority: "Medium",
          notes: ""
        })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirements", projectId] });
      onToast("Requirement added.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/requirements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirements", projectId] });
      onToast("Requirement updated.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/requirements/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requirements", projectId] });
      onToast("Requirement deleted.");
    }
  });

  const [filter, setFilter] = useState("All");

  const shown = filter === "All" 
    ? requirements 
    : requirements.filter((r: any) => r.status === filter);

  const knownCount = requirements.filter((r: any) => r.status === "Known").length;
  const partialCount = requirements.filter((r: any) => r.status === "Partially known").length;
  const missingCount = requirements.filter((r: any) => r.status === "Missing").length;
  const total = requirements.length;
  
  const completeness = total > 0 ? Math.round(((knownCount * 1) + (partialCount * 0.5)) / total * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="DISCOVERY REQUIREMENTS"
        title="What do we still need to know?"
        subtitle="Track the information you still need to understand the customer problem."
        action={
          <Button onClick={() => createMutation.mutate()}>
            <Plus size={16} /> Add requirement
          </Button>
        }
      />
      <div className="requirement-summary">
        <div className="requirement-summary-score">
          <span className="card-kicker">DISCOVERY COMPLETENESS</span>
          <strong>{completeness}<span>%</span></strong>
          <p>{knownCount} of {total} context areas are clear.</p>
          <ProgressBar value={completeness} color="violet" />
        </div>
        <div className="requirement-summary-text">
          <Sparkles size={18} />
          <p>Fill the high-priority gaps first. The strongest next conversation is usually hiding inside the information you do not have yet.</p>
        </div>
        <div className="requirement-legend">
          <span><i className="legend-dot known" /> Known <b>{knownCount}</b></span>
          <span><i className="legend-dot partial" /> Partially known <b>{partialCount}</b></span>
          <span><i className="legend-dot missing" /> Missing <b>{missingCount}</b></span>
        </div>
      </div>
      <section className="surface-card requirements-card">
        <div className="requirements-toolbar">
          <div>
            <span className="card-kicker">ACTIVE PROJECT</span>
            <h3>Discovery context map</h3>
          </div>
          <div className="filter-tabs requirement-filter-tabs">
            {["All", "Known", "Partially known", "Missing"].map(item => (
              <button 
                key={item} 
                className={filter === item ? "active" : ""} 
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="requirements-table">
          <div className="requirements-head">
            <span>Requirement</span>
            <span>Category</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Updated</span>
            <span />
          </div>
          {shown.map((req: any) => (
            <div className="requirement-row" key={req.id}>
              <div className="requirement-name">
                <div className={`requirement-icon ${req.status === "Known" ? "known" : req.status === "Missing" ? "missing" : "partial"}`}>
                  {req.status === "Known" ? <Check size={14} /> : req.status === "Missing" ? <AlertCircle size={14} /> : <Clock3 size={14} />}
                </div>
                <strong>{req.title}</strong>
              </div>
              <span>{req.category}</span>
              <Badge tone={req.status === "Known" ? "mint" : req.status === "Missing" ? "rose" : "amber"}>{req.status}</Badge>
              <Badge tone={req.priority === "High" ? "rose" : req.priority === "Medium" ? "amber" : "slate"}>{req.priority}</Badge>
              <span className="updated-cell">Just now</span>
              <div className="row-actions">
                <button onClick={() => updateMutation.mutate({ id: req.id, status: req.status === "Known" ? "Missing" : "Known" })} title="Toggle status">
                  <Check size={14} />
                </button>
                <button onClick={() => onToast("Requirement edit not implemented in this demo.")}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteMutation.mutate(req.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function QuestionsPage({ onToast }: { onToast: (message: string) => void }) {
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });
  const projectId = projectsList[0]?.id || 6; // Defaulting to 1
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All questions");

  const { data: questions = [] } = useQuery({
    queryKey: ["questions", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/questions?projectId=${projectId}`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          question: "What would a successful experience look like?",
          priority: "Medium",
          purpose: "Define success criteria."
        })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId] });
      onToast("Question added.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/questions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId] });
      onToast("Question deleted.");
    }
  });

  const shown = questions.filter((q: any) => 
    filter === "All questions" || 
    (filter === "High priority" && q.priority === "High") || 
    (filter === "Unanswered" && q.status === "Unanswered") || 
    (filter === "Answered" && q.status === "Answered")
  );

  return (
    <>
      <PageHeader
        eyebrow="DISCOVERY QUESTIONS"
        title="Ask better questions next."
        subtitle="Manage and organize AI-generated questions for customer interviews."
        action={
          <Button onClick={() => createMutation.mutate()}>
            <Plus size={16} /> Add question
          </Button>
        }
      />
      <div className="filter-tabs">
        {["All questions", "High priority", "Unanswered", "Answered"].map(item => (
          <button 
            className={filter === item ? "active" : ""} 
            key={item} 
            onClick={() => setFilter(item)}
          >
            {item}
            <span>
              {item === "All questions" 
                ? questions.length 
                : questions.filter((q: any) => item === "High priority" ? q.priority === "High" : q.status === item).length}
            </span>
          </button>
        ))}
      </div>
      <section className="surface-card question-table-card">
        <div className="question-table-head">
          <span>Question</span>
          <span>Priority</span>
          <span>Project</span>
          <span>Status</span>
          <span />
        </div>
        {shown.map((q: any, index: number) => (
          <div className="question-table-row" key={q.id}>
            <div className="question-table-copy">
              <div className="question-table-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <strong>{q.question}</strong>
                <span>{q.purpose}</span>
              </div>
            </div>
            <Badge tone={q.priority === "High" ? "rose" : "amber"}>{q.priority}</Badge>
            <span className="question-project">
              <div className="project-logo blue tiny">R</div>
              Project {projectId}
            </span>
            <Badge tone={q.status === "Answered" ? "mint" : "slate"}>{q.status}</Badge>
            <div className="row-actions">
              <button onClick={() => {
                updateStatusMutation.mutate({ 
                  id: q.id, 
                  status: q.status === "Answered" ? "Unanswered" : "Answered" 
                });
                onToast(`Marked as ${q.status === "Answered" ? "Unanswered" : "Answered"}`);
              }}>
                <Check size={14} />
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(q.question); onToast("Question copied."); }}>
                <Copy size={14} />
              </button>
              <button onClick={() => deleteMutation.mutate(q.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            No questions found.
          </div>
        )}
      </section>
    </>
  );
}
function ReportsPage({ onToast }: { onToast: (message: string) => void }) {
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });
  const projectId = projectsList[0]?.id || 6;
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/reports?projectId=${projectId}`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
      onToast("Report builder generated.");
    }
  });

  const handleExport = (id: number) => {
    window.open(`/api/reports/${id}/export`, '_blank');
    onToast("PDF export prepared.");
  };

  return (
    <>
      <PageHeader
        eyebrow="DISCOVERY REPORTS"
        title="Make your findings shareable."
        subtitle="Turn customer discovery findings into clear, shareable reports."
        action={
          <Button onClick={() => createMutation.mutate()}>
            <Plus size={16} /> Create report
          </Button>
        }
      />
      <div className="report-highlight">
        <div className="report-highlight-icon">
          <FileText size={21} />
        </div>
        <div>
          <span className="card-kicker">REPORTING THAT PRESERVES THE REASONING</span>
          <h3>Make the “why” visible—not just the “what.”</h3>
          <p>Every report keeps the goal, root problem, evidence, gaps, and recommended next step connected.</p>
        </div>
        {reports.length > 0 && (
          <Button variant="dark" onClick={() => handleExport(reports[0].id)}>
            <Download size={15} /> Export latest
          </Button>
        )}
      </div>
      <div className="reports-grid">
        {reports.map((report: any, index: number) => (
          <div className="report-card surface-card" key={report.id}>
            <div className="report-card-top">
              <div className={`report-type ${index === 0 ? "blue" : index === 1 ? "violet" : "mint"}`}>
                <FileText size={19} />
              </div>
              <Badge tone={report.status === "Draft" ? "blue" : "mint"}>{report.status}</Badge>
            </div>
            <div className="card-kicker">DISCOVERY REPORT</div>
            <h3>{report.title}</h3>
            <p>Generated report for project {projectId}</p>
            <div className="report-card-footer">
              <span>
                <Clock3 size={13} /> 
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              <div>
                <button onClick={() => handleExport(report.id)}>
                  <Download size={15} />
                </button>
                <button onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/api/reports/${report.id}/export`);
                  onToast("Share link copied to clipboard.");
                }}>
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="surface-card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>No reports generated yet.</p>
            <Button onClick={() => createMutation.mutate()}>Generate your first report</Button>
          </div>
        )}
      </div>
    </>
  );
}

function IntelligencePage({ onToast }: { onToast: (message: string) => void }) {
  return <><PageHeader eyebrow="CUSTOMER INTELLIGENCE" title="See the patterns behind the conversations." subtitle="Zoom out from individual interviews to understand what is recurring across your research." action={<Button variant="secondary" onClick={() => onToast("Date range selector opened.")}><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></Button>} /><div className="intelligence-metrics"><div><span>Problems discovered</span><strong>36</strong><small><TrendingUp size={12} /> 18% vs previous period</small></div><div><span>Recurring problems</span><strong>11</strong><small><TrendingUp size={12} /> Across 7 projects</small></div><div><span>High-confidence problems</span><strong>24</strong><small><TrendingUp size={12} /> 67% of total</small></div><div><span>Unvalidated problems</span><strong>12</strong><small className="muted">Need more evidence</small></div></div><div className="intelligence-grid"><section className="surface-card chart-card"><div className="card-heading compact"><div><span className="card-kicker">DISCOVERY TRENDS</span><h3>Problem confidence over time</h3></div><div className="chart-legend"><span><i className="blue-dot" /> Confidence</span><span><i className="gray-dot" /> Problems</span></div></div><div className="chart-area"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-main"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 600 210" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5267f5" stopOpacity=".26" /><stop offset="100%" stopColor="#5267f5" stopOpacity="0" /></linearGradient></defs><path d="M0 165 C42 156, 65 149, 100 154 S165 126, 200 132 S262 106, 300 118 S362 89, 400 98 S465 73, 500 78 S560 45, 600 52 L600 210 L0 210 Z" fill="url(#areaGradient)" /><path d="M0 165 C42 156, 65 149, 100 154 S165 126, 200 132 S262 106, 300 118 S362 89, 400 98 S465 73, 500 78 S560 45, 600 52" fill="none" stroke="#5267f5" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>Aug 12</span><span>Aug 19</span><span>Aug 26</span><span>Sep 02</span><span>Sep 10</span></div></div></div></section><section className="surface-card recurring-card"><div className="card-heading compact"><div><span className="card-kicker">TOP RECURRING PROBLEMS</span><h3>What keeps showing up</h3></div><button className="more-button"><MoreHorizontal size={18} /></button></div><div className="recurring-list">{[["Transfer reliability", "4 conversations", 86, "blue"], ["Support dependency", "3 conversations", 72, "violet"], ["Unclear terminology", "3 conversations", 64, "amber"], ["Slow task completion", "2 conversations", 49, "mint"]].map(([name, count, value, color]) => <div className="recurring-row" key={name}><div className="recurring-row-head"><strong>{name}</strong><span>{count}</span></div><ProgressBar value={value as number} color={color as string} /></div>)}</div></section></div><div className="intelligence-lower"><section className="surface-card insights-list"><div className="card-heading compact"><div><span className="card-kicker">AI-GENERATED INSIGHTS</span><h3>The story across your research</h3></div></div>{["Transfer reliability appears in 4 recent customer conversations.", "Customer support dependency is a recurring symptom across 3 projects.", "Problem confidence is highest when customer evidence includes specific behavioral examples."].map((insight, index) => <div className="intelligence-insight" key={insight}><div className={`intelligence-insight-icon ${index === 0 ? "blue" : index === 1 ? "violet" : "mint"}`}><Sparkles size={15} /></div><div><strong>{insight}</strong><span>{index === 0 ? "Retail Banking App · 4 signals" : index === 1 ? "3 projects · 8 signals" : "Workspace pattern · 48 analyses"}</span></div><ArrowRight size={15} /></div>)}</section><section className="surface-card friction-card"><div className="card-heading compact"><div><span className="card-kicker">TOP CUSTOMER FRICTIONS</span><h3>By category</h3></div></div><div className="friction-bars">{[["Reliability", 82], ["Clarity", 67], ["Speed", 54], ["Confidence", 47]].map(([label, value]) => <div key={label}><div><span>{label}</span><strong>{value}%</strong></div><ProgressBar value={value as number} color="blue" /></div>)}</div></section></div></>;
}


function SettingsPage({ onToast }: { onToast: (message: string) => void }) {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const [workspaceName, setWorkspaceName] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (settings) {
      setWorkspaceName(settings.workspace_name || "CLARIVON Discovery Workspace");
      setAiProvider(settings.ai_provider || "openai");
      setApiKey(settings.api_key || "");
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      onToast("Workspace settings saved.");
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="PERSONAL SETTINGS"
        title="Make CLARIVON work your way."
        subtitle="Control your workspace, AI preferences, and notifications."
      />
      <div className="settings-layout">
        <div className="settings-nav surface-card">
          <button className="active"><UserRound size={16} /> Account & Workspace</button>
          <button><Sparkles size={16} /> AI preferences</button>
          <button><Bell size={16} /> Notifications</button>
        </div>
        <div className="settings-panels">
          <section className="surface-card settings-card">
            <div className="settings-card-head">
              <div>
                <span className="card-kicker">WORKSPACE</span>
                <h3>Workspace Settings</h3>
                <p>Configure your organization name and credentials.</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => updateMutation.mutate({ workspace_name: workspaceName, ai_provider: aiProvider, api_key: apiKey })}
              >
                <Check size={15} /> Save changes
              </Button>
            </div>
            <div className="settings-form">
              <label>
                Workspace Name
                <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="CLARIVON Workspace" />
              </label>
              <label>
                AI Provider
                <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
                  <option value="openai">OpenAI GPT-4o</option>
                  <option value="anthropic">Anthropic Claude 3.5</option>
                  <option value="gemini">Google Gemini 1.5</option>
                  <option value="local">Local Ollama / Llama 3</option>
                </select>
              </label>
              <label>
                API Key (Optional / Private)
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
              </label>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}



function ProfilePage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user-profile");
      const json = await res.json();
      return json.success ? json.data : null;
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "John Doe");
      setEmail(profile.email || "john.doe@clarivon.com");
      setRole(profile.role || "Lead Product Manager");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      onToast("Profile updated successfully.");
      setIsEditing(false);
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="YOUR PROFILE"
        title={profile?.name || "John Doe"}
        subtitle={`${profile?.role || "Product Manager"} · Customer Discovery & Requirement Intelligence`}
        action={
          <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
            <Pencil size={15} /> {isEditing ? "Cancel" : "Edit profile"}
          </Button>
        }
      />
      {isEditing && (
        <section className="surface-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3>Edit Profile</h3>
          <div className="settings-form" style={{ marginTop: "1rem" }}>
            <label>
              Full Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Email Address
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Role / Title
              <input value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <Button onClick={() => updateMutation.mutate({ name, email, role, avatar: name.split(' ').map(n=>n[0]).join('').slice(0,2) })}>
              Save Profile
            </Button>
          </div>
        </section>
      )}
      <div className="profile-grid">
        <section className="surface-card profile-card">
          <div className="profile-hero">
            <div className="profile-avatar-large">{profile?.avatar || "JD"}</div>
            <div>
              <h3>{profile?.name || "John Doe"}</h3>
              <p>{profile?.role || "Product Manager"}</p>
              <span><Mail size={13} /> {profile?.email || "john.doe@clarivon.com"}</span>
            </div>
          </div>
        </section>
        <section className="surface-card profile-actions">
          <div className="card-heading compact">
            <div>
              <span className="card-kicker">ACCOUNT SECURITY</span>
              <h3>Keep your account secure</h3>
            </div>
          </div>
          <button onClick={() => { onToast("Signed out of session."); navigate("/"); }}>
            <LogOut size={17} />
            <span><strong>Sign out</strong><small>End your current session</small></span>
            <ChevronRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}


const requirementData = {
  input: "Customers want to complete checkout faster. Returning users should not have to enter their delivery information every time. The checkout should remember their previous address and make the process much quicker.",
  requirement: "The system should allow returning customers to reuse previously entered delivery information during checkout.",
  evidence: "Returning users should not have to enter their delivery information every time.",
  questions: [
    ["Which customer information should be saved and reused during checkout?", "High", "Clarify data scope for REQ-001."],
    ["How long should saved delivery information remain available?", "High", "Define retention behavior."],
    ["Should customers be able to edit saved information before checkout?", "Medium", "Define the customer control point."],
    ["Should saved information be available across different devices?", "Medium", "Clarify account and device scope."],
  ],
};

function RequirementStats() {
  return <div className="requirement-stats"><StatCard label="Requirements analyzed" value="42" delta="8 this month" icon={FileText} accent="blue" /><StatCard label="Requirements extracted" value="86" delta="18 development-ready" icon={Sparkles} accent="violet" /><StatCard label="Ambiguities detected" value="14" delta="5 high severity" icon={AlertCircle} accent="amber" /><StatCard label="Clarifications needed" value="9" delta="3 blocking" icon={MessageCircleQuestion} accent="mint" /><StatCard label="Requirement confidence" value="91%" delta="↑ 6% this month" icon={Gauge} accent="blue" /></div>;
}

function RequirementWorkflow() {
  const stages = [["01", "Customer input", "Raw business voice"], ["02", "AI analysis", "Understand intent"], ["03", "Requirement extraction", "Find what to build"], ["04", "Classification", "Type and priority"], ["05", "Ambiguity check", "Find unclear language"], ["06", "Missing information", "Close context gaps"], ["07", "Conflict detection", "Keep it consistent"], ["08", "Clarifications", "Ask what matters"], ["09", "Acceptance criteria", "Make it testable"], ["10", "Development-ready", "Ready to build"]];
  return <div className="requirement-workflow">{stages.map(([number, title, subtitle], i) => <div className={`requirement-stage ${i === 2 ? "active" : i === 9 ? "ready" : ""}`} key={title}><span>{number}</span><strong>{title}</strong><small>{subtitle}</small>{i < stages.length - 1 && <ArrowDown size={14} />}</div>)}</div>;
}

function RequirementDashboard({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · RETAIL BANKING APP" title="Requirement Intelligence" subtitle="Turn customer needs into clear, actionable, development-ready requirements." action={<Button onClick={() => navigate("/requirement-analysis")}><Sparkles size={16} /> New requirement analysis</Button>} /><RequirementStats /><div className="requirement-dashboard-grid"><section className="surface-card requirement-workflow-card"><div className="card-heading"><div><span className="card-kicker"><span className="live-dot" /> REQUIREMENT INTELLIGENCE WORKFLOW</span><h3>From validated problem to build-ready brief</h3><p>CLARIVON turns discovery evidence into requirements without losing the customer context behind them.</p></div><Badge tone="mint">91% confidence</Badge></div><RequirementWorkflow /><div className="workflow-footer"><div><span className="workflow-footer-dot" /> <strong>18 requirements</strong><span>from 8 discovery conversations</span></div><button className="text-button" onClick={() => navigate("/requirements-list")}>Review requirements <ArrowRight size={14} /></button></div></section><aside className="insight-card requirement-ai-card surface-card"><div className="insight-card-head"><div className="ai-orb"><Sparkles size={17} /></div><span>CLARIVON AI</span><span className="ai-status">Requirement mode</span></div><h3>What needs your attention</h3><div className="ai-callout"><div className="callout-number">01</div><p><strong>2 requirements are ambiguous.</strong> “Faster checkout” needs a measurable target.</p></div><div className="ai-callout"><div className="callout-number">02</div><p><strong>3 clarification questions</strong> should be answered before development.</p></div><button className="text-button" onClick={() => navigate("/clarifications")}>Review clarifications <ArrowRight size={14} /></button></aside></div><section className="surface-card recent-requirements"><div className="card-heading compact"><div><span className="card-kicker">KEEP THE HANDOFF MOVING</span><h3>Recent requirement analyses</h3></div><button className="text-button" onClick={() => navigate("/requirements-list")}>View all <ArrowRight size={14} /></button></div><div className="recent-requirement-grid">{[["Retail Banking App", "8 requirements", "92% confidence", "3 clarifications", "blue"], ["E-Commerce Checkout", "12 requirements", "88% confidence", "4 clarifications", "violet"], ["Healthcare Appointment System", "16 requirements", "94% confidence", "2 clarifications", "mint"]].map(([name, count, confidence, clarifications, tone]) => <button className="recent-requirement-card" key={name} onClick={() => navigate("/requirements-list")}><div className={`project-logo large ${tone}`}>{name.slice(0, 1)}</div><strong>{name}</strong><span>{count} · {confidence}</span><Badge tone={clarifications.startsWith("2") ? "mint" : "amber"}>{clarifications}</Badge><ArrowRight size={15} /></button>)}</div></section></>;
}

function RequirementAnalysisPage({ onToast }: { onToast: (message: string) => void }) {
  const [tab, setTab] = useState("Business Request");
  const [text, setText] = useState(requirementData.input);
  const [mode, setMode] = useState<"idle" | "loading" | "results">(new URLSearchParams(window.location.search).has("from") ? "results" : "idle");
  useEffect(() => { if (mode !== "loading") return; const t = window.setTimeout(() => setMode("results"), 2400); return () => window.clearTimeout(t); }, [mode]);
  if (mode === "loading") return <RequirementLoading />;
  if (mode === "results") return <RequirementResults text={text} onToast={onToast} onReset={() => setMode("idle")} />;
  return <><PageHeader eyebrow="NEW ANALYSIS · REQUIREMENT INTELLIGENCE" title="New Requirement Analysis" subtitle="Transform unstructured customer input into clear, actionable requirements." action={<div className="analysis-progress-pill"><span>STEP 01</span><strong>Capture business input</strong><span>of 04</span></div>} /><div className="analysis-layout"><main><div className="surface-card requirement-bridge"><div className="bridge-icon"><Workflow size={19} /></div><div><span className="card-kicker">CONNECTED TO CUSTOMER DISCOVERY</span><h3>Use validated discovery findings</h3><p>Start from the Retail Banking App problem we just validated: customers need a reliable way to transfer money independently.</p></div><Button variant="secondary" onClick={() => { setText("Validated problem: Customers lack a simple and reliable way to complete money transfers independently. Customer goal: Complete money transfers without support. Evidence: Customers retry multiple times and call support."); onToast("Customer discovery findings loaded into this analysis."); }}>Use findings <ArrowRight size={15} /></Button></div><div className="surface-card project-picker"><div className="card-heading compact"><div><span className="card-kicker">PROJECT</span><h3>Where should we save this analysis?</h3></div><Button variant="secondary" onClick={() => onToast("Project creation modal opened.")}><Plus size={15} /> New project</Button></div><div className="select-like"><div className="project-logo blue">R</div><div><strong>Retail Banking App</strong><span>FinBank · 18 requirements</span></div><ChevronDown size={17} /></div></div><div className="surface-card conversation-card"><div className="card-heading"><div><span className="card-kicker">CAPTURE BUSINESS VOICE</span><h3>What does the customer or business need?</h3><p>CLARIVON will distinguish facts, inferences, assumptions, ambiguities, and recommendations.</p></div><div className="conversation-count">{text.length}<span>/ 10,000</span></div></div><div className="analysis-tabs requirement-tabs">{["Customer Conversation", "Discovery Report", "Email", "Meeting Notes", "Business Request", "Document", "Manual Input"].map(item => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "Document" && <Upload size={14} />}{item}</button>)}</div>{tab === "Document" ? <div className="upload-zone"><div className="upload-icon"><Upload size={22} /></div><strong>Drop a document here</strong><span>PDF, DOCX, or TXT · up to 20 MB</span><Button variant="secondary" onClick={() => onToast("File picker opened.")}>Choose file</Button></div> : <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the customer requirement, business request, email, meeting notes, or discovery findings here..." />}{tab !== "Document" && <div className="conversation-footer"><div><span className="input-tip"><Lightbulb size={14} /> Tip</span> Include specific behavior and constraints for stronger requirements.</div><Button onClick={() => setMode("loading")}><Sparkles size={16} /> Analyze requirements</Button></div>}</div><div className="analysis-note requirement-note"><Sparkles size={16} /><div><strong>From problem to requirement.</strong><p>We’ll turn the validated need into functional and non-functional requirements, business rules, acceptance criteria, edge cases, and a development-readiness check.</p></div></div></main><aside className="analysis-side"><div className="side-progress surface-card"><div className="side-progress-head"><strong>Requirement flow</strong><span>1 of 4</span></div><ProgressBar value={25} color="violet" /><div className="mini-flow"><div className="mini-flow-item active"><span><Check size={12} /></span><div><strong>Capture</strong><small>Add customer or business input</small></div></div><div className="mini-flow-item"><span>2</span><div><strong>Analyze</strong><small>Extract and classify</small></div></div><div className="mini-flow-item"><span>3</span><div><strong>Clarify</strong><small>Find gaps and conflicts</small></div></div><div className="mini-flow-item"><span>4</span><div><strong>Ready</strong><small>Prepare for development</small></div></div></div></div><div className="side-ai surface-card"><div className="insight-card-head"><div className="ai-orb"><Sparkles size={15} /></div><span>AI ASSISTANT</span></div><p>“A good requirement is not just a feature request. It is a clear, testable expression of the customer need—with its rules and edges intact.”</p><span className="ai-sig">— CLARIVON AI</span></div></aside></div></>;
}

function RequirementLoading() {
  return <div className="analysis-loading requirement-loading"><div className="analysis-loading-orb"><Sparkles size={28} /></div><div className="eyebrow">CLARIVON AI · REQUIREMENT MODE</div><h2>Turning customer need into clarity.</h2><p>We’re extracting what needs to be built, what is still unclear, and what would make it ready for development.</p><div className="loading-steps">{["Reading customer input", "Extracting requirements", "Classifying requirements", "Detecting ambiguity", "Checking missing information", "Detecting conflicts", "Identifying business rules", "Generating acceptance criteria", "Identifying edge cases", "Preparing development-ready requirements"].map((step, index) => <div className={`loading-step ${index < 5 ? "done" : index === 5 ? "current" : ""}`} key={step}><span>{index < 5 ? <Check size={13} /> : index === 5 ? <span className="loading-pulse" /> : <Circle size={12} />}</span>{step}{index < 5 && <small>complete</small>}</div>)}</div><div className="loading-progress"><ProgressBar value={69} color="violet" /><span>Almost done · checking requirement quality and readiness</span></div></div>;
}

function RequirementResults({ text, onToast, onReset }: { text: string; onToast: (message: string) => void; onReset: () => void }) {
  const [ready, setReady] = useState(false);
  const [resolved, setResolved] = useState(false);
  return <div className="results-page requirement-results"><div className="results-top"><div><div className="eyebrow">ANALYSIS COMPLETE · REQUIREMENT INTELLIGENCE</div><h2>Here’s what should be built.</h2><p>CLARIVON connected the customer need to actionable requirements—and surfaced what still needs a human decision.</p></div><div className="results-actions"><Button variant="secondary" onClick={onReset}><Pencil size={15} /> Edit input</Button><Button onClick={() => { setReady(true); onToast("Requirement is ready for development."); }}>{ready ? <Check size={15} /> : <ShieldCheck size={15} />} {ready ? "Development ready" : "Mark development ready"}</Button></div></div><div className="results-meta"><span><span className="live-dot" /> Requirement analysis complete</span><span>Retail Banking App</span><span>From validated discovery findings</span><span>Analyzed just now</span></div><div className="results-grid"><div className="results-main"><section className="result-block accent-violet"><div className="result-label"><span className="result-num">01</span><div><span className="card-kicker">BUSINESS NEED</span><h3>What outcome needs to change?</h3></div><Badge tone="mint">92% confidence</Badge></div><p className="result-lead">Reduce repetitive checkout effort for returning customers while preserving customer control and privacy.</p><div className="traceability-mini"><span>VALIDATED CUSTOMER PROBLEM</span><p>Returning customers experience repetitive checkout data entry and lose confidence when the process feels slow.</p></div></section><section className="result-block requirement-card-highlight"><div className="result-label"><span className="result-num">02</span><div><span className="card-kicker">REQ-001 · FUNCTIONAL REQUIREMENT</span><h3>Remember returning customer information</h3></div><Badge tone="blue">High priority</Badge></div><p className="result-lead">{requirementData.requirement}</p><div className="requirement-card-meta"><span>94% confidence</span><span>Source: Customer request</span><span>Status: {ready ? "Development Ready" : "Needs Clarification"}</span></div><div className="evidence-highlight"><span>“{requirementData.evidence}”</span><small>Direct customer evidence</small></div></section><section className="result-block"><div className="result-label"><span className="result-num">03</span><div><span className="card-kicker">CLASSIFICATION</span><h3>Requirement types identified</h3></div></div><div className="classification-grid">{[["Functional requirement", "Allow users to reuse saved delivery information.", "blue"], ["UX requirement", "Checkout should minimize repetitive data entry.", "violet"], ["Business rule", "Only explicitly permitted information may be reused.", "amber"], ["Security requirement", "Sensitive information must not be stored without authorization.", "rose"]].map(([title, desc, tone]) => <div className={`classification-card ${tone}`} key={title}><strong>{title}</strong><p>{desc}</p><Badge tone={tone === "rose" ? "rose" : tone}>{tone === "amber" ? "Needs validation" : "Identified"}</Badge></div>)}</div></section><section className="result-block ambiguity-block"><div className="result-label"><span className="result-num">04</span><div><span className="card-kicker">AMBIGUITIES DETECTED</span><h3>What is still unclear?</h3></div><Badge tone="rose">2 high severity</Badge></div><div className="ambiguity-list"><div className="ambiguity-row"><div><strong>“Checkout should be faster.”</strong><p>“Faster” does not define a measurable target.</p></div><Badge tone="rose">High</Badge><span>Suggested: What target completion time should the team aim for?</span></div><div className="ambiguity-row"><div><strong>“Remember customer information.”</strong><p>It is unclear which customer information may be stored and reused.</p></div><Badge tone="rose">High</Badge><span>Suggested: Which customer information should be automatically reused?</span></div></div></section><section className="result-block"><div className="result-label"><span className="result-num">05</span><div><span className="card-kicker">MISSING INFORMATION</span><h3>What is required before development?</h3></div><Badge tone="amber">5 context gaps</Badge></div><div className="missing-grid">{[["Data scope", "Which customer information can be stored?", "High"], ["Retention", "How long should saved information remain available?", "High"], ["Edit behavior", "Can customers edit saved information before checkout?", "Medium"], ["Cross-device", "Should saved information sync across devices?", "Medium"], ["Privacy", "Are there restrictions on sensitive information?", "High"]].map(([title, desc, priority]) => <div className="missing-card" key={title}><div><strong>{title}</strong><Badge tone={priority === "High" ? "rose" : "amber"}>{priority} priority</Badge></div><p>{desc}</p></div>)}</div></section><section className="result-block conflict-block"><div className="result-label"><span className="result-num">06</span><div><span className="card-kicker">CONFLICT DETECTION</span><h3>Potential conflict detected</h3></div><Badge tone="rose">High severity</Badge></div><div className="conflict-box"><AlertCircle size={18} /><div><strong>Saved addresses vs. address confirmation</strong><p>“Customers should not need to enter their address again” may conflict with “Customers must confirm their address every time.”</p><span>Recommended resolution: clarify whether confirmation can occur without full re-entry.</span></div><Button variant="secondary" onClick={() => onToast("Conflict marked for resolution.")}>{resolved ? "Resolving" : "Resolve"}</Button></div></section><section className="result-block questions-block"><div className="result-label"><span className="result-num">07</span><div><span className="card-kicker">CLARIFICATION QUESTIONS</span><h3>Ask before approving the requirement.</h3></div><Button variant="secondary" onClick={() => onToast("Questions copied to clipboard.")}><Copy size={14} /> Copy questions</Button></div><div className="question-list">{requirementData.questions.map(([question, priority, purpose], i) => <div className="question-row" key={question}><span className="question-number">0{i + 1}</span><div className="question-copy"><strong>{question}</strong><span>{purpose}</span></div><Badge tone={priority === "High" ? "rose" : "amber"}>{priority}</Badge><button onClick={() => onToast("Clarification copied.")}><Copy size={15} /></button></div>)}</div></section><section className="result-block acceptance-block"><div className="result-label"><span className="result-num">08</span><div><span className="card-kicker">ACCEPTANCE CRITERIA</span><h3>Make REQ-001 testable.</h3></div><Button variant="ghost" onClick={() => onToast("Acceptance criterion added.")}><Plus size={14} /> Add criterion</Button></div><div className="acceptance-list">{[["AC-001", "Given a returning customer has previously saved a delivery address, when they reach checkout, then the saved address should be available for selection."], ["AC-002", "Given a customer selects a saved address, when they continue checkout, then the address should be populated automatically."], ["AC-003", "The customer must be able to edit the saved address before placing the order."]].map(([id, text]) => <div className="acceptance-row" key={id}><span>{id}</span><p>{text}</p><button onClick={() => onToast("Acceptance criterion edited.")}><Pencil size={14} /></button></div>)}</div></section><section className="result-block"><div className="result-label"><span className="result-num">09</span><div><span className="card-kicker">BUSINESS RULES & EDGE CASES</span><h3>Protect the customer experience.</h3></div></div><div className="rules-edge-grid"><div><span className="subsection-label">BUSINESS RULES</span><ul><li>Customers must explicitly authorize storage of reusable delivery information.</li><li>Expired or invalid addresses must not be automatically selected.</li><li>Customers must be able to modify saved information before checkout.</li></ul></div><div><span className="subsection-label">EDGE CASES</span><ul><li>Customer has multiple saved addresses.</li><li>Saved address is outdated or incomplete.</li><li>Customer uses a new device or removes saved information.</li></ul></div></div></section></div><aside className="results-side"><div className="surface-card validation-card"><div className="card-kicker">REQUIREMENT QUALITY</div><h3>Is this ready for development?</h3><div className="validation-rings"><ConfidenceRing value={94} label="Requirement confidence" /><ConfidenceRing value={88} label="Requirement clarity" /><ConfidenceRing value={91} label="Evidence strength" /></div><div className="validation-stat"><div><span>Context completeness</span><strong>76%</strong></div><ProgressBar value={76} color="violet" /></div><div className="validation-stat"><div><span>Validation needed</span><strong>24%</strong></div><ProgressBar value={24} color="amber" /></div><div className="validation-summary"><ShieldCheck size={16} /><p>The core requirement is strongly supported, but retention and privacy rules require clarification.</p></div></div><div className="surface-card readiness-card"><div className="card-kicker">DEVELOPMENT READINESS</div><h3>{ready ? "Development Ready" : "Not ready yet"}</h3><div className="readiness-list">{["Clear requirement", "Supporting evidence", "No critical ambiguity", "No unresolved conflict", "Acceptance criteria", "Business rules", "Edge cases reviewed"].map((item, i) => <div key={item} className={ready || i < 3 ? "checked" : ""}><span>{ready || i < 3 ? <Check size={12} /> : <Circle size={11} />}</span>{item}</div>)}</div>{!ready && <p>Resolve critical clarifications and the address-confirmation conflict before handing off.</p>}</div><div className="surface-card source-card"><div className="card-kicker">SOURCE CONTEXT</div><div className="source-quote">“{text}”</div><button className="text-button" onClick={onReset}>Edit source <Pencil size={14} /></button></div></aside></div><section className="surface-card traceability-card"><div className="card-heading compact"><div><div className="card-kicker">REQUIREMENT TRACEABILITY</div><h3>Keep the “why” connected to the “what.”</h3></div><Button variant="secondary" onClick={() => onToast("Requirement report export prepared.")}><Download size={15} /> Export requirement report</Button></div><div className="traceability-flow"><div><span>Customer evidence</span><strong>“I don’t want to enter my address every time.”</strong></div><ArrowRight size={16} /><div><span>Validated problem</span><strong>Returning customers experience repetitive checkout data entry.</strong></div><ArrowRight size={16} /><div><span>Business need</span><strong>Reduce repetitive checkout effort.</strong></div><ArrowRight size={16} /><div><span>Requirement</span><strong>Allow returning customers to reuse saved delivery information.</strong></div></div></section></div>;
}

function RequirementsListPage({ onToast }: { onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All");
  const rows = [["REQ-001", "Reuse customer address", "Functional", "High", "94%", "Validated"], ["REQ-002", "Allow address editing", "Functional", "High", "91%", "Development Ready"], ["REQ-003", "Protect saved address data", "Security", "High", "82%", "Needs Clarification"], ["REQ-004", "Address loads quickly", "Performance", "Medium", "78%", "Under Review"], ["REQ-005", "Remember multiple addresses", "UX", "Medium", "86%", "Draft"]];
  const shown = filter === "All" ? rows : rows.filter(r => r[2].toLowerCase().includes(filter.toLowerCase()) || r[5].toLowerCase().includes(filter.toLowerCase()));
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · WORKSPACE" title="Requirements" subtitle="Manage structured requirements across your projects." action={<Button onClick={() => onToast("New requirement analysis opened.")}><Plus size={16} /> New requirement</Button>} /><div className="toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search requirements..." /></div><Button variant="secondary"><Filter size={15} /> Filter <ChevronDown size={14} /></Button></div><div className="filter-tabs requirement-filter-tabs">{["All", "Functional", "Non-Functional", "Business Rules", "Security", "Needs Clarification", "Validated", "Development Ready"].map(item => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? 18 : shown.length}</span></button>)}</div><section className="surface-card requirement-table-card"><div className="requirement-table-head"><span>ID</span><span>Requirement</span><span>Type</span><span>Priority</span><span>Confidence</span><span>Status</span><span>Project</span><span>Updated</span></div>{shown.map(row => <div className="requirement-table-row" key={row[0]}><span className="req-id">{row[0]}</span><strong>{row[1]}</strong><span>{row[2]}</span><Badge tone={row[3] === "High" ? "rose" : "amber"}>{row[3]}</Badge><strong className="confidence-text">{row[4]}</strong><Badge tone={row[5] === "Development Ready" || row[5] === "Validated" ? "mint" : row[5] === "Needs Clarification" ? "rose" : "slate"}>{row[5]}</Badge><span>Retail Banking App</span><span className="updated-cell">Today</span></div>)}</section></>;
}


function ClarificationsPage({ onToast }: { onToast: (message: string) => void }) {
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });
  const projectId = projectsList[0]?.id || 6;
  const queryClient = useQueryClient();

  const { data: clarifications = [] } = useQuery({
    queryKey: ["clarifications", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/clarifications?projectId=${projectId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, answer }: { id: number; status?: string; answer?: string }) => {
      const res = await fetch(`/api/clarifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, answer })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clarifications", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/clarifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          question: "Should guest users undergo email OTP verification before payment submission?",
          priority: "High",
          category: "Security"
        })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clarifications", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      onToast("Clarification question added.");
    }
  });

  const openCount = clarifications.filter((c: any) => c.status === "Open").length;
  const resolvedCount = clarifications.filter((c: any) => c.status === "Resolved").length;

  return (
    <>
      <PageHeader
        eyebrow="REQUIREMENT INTELLIGENCE"
        title="Clarifications"
        subtitle="Resolve ambiguity before requirements reach development."
        action={
          <Button onClick={() => createMutation.mutate()}>
            <Plus size={16} /> Add clarification
          </Button>
        }
      />
      <div className="clarification-metrics">
        <div><span>Open questions</span><strong>{openCount}</strong></div>
        <div><span>Resolved questions</span><strong>{resolvedCount}</strong></div>
        <div><span>High priority</span><strong>{clarifications.filter((c: any) => c.priority === "High").length}</strong></div>
        <div><span>Total items</span><strong>{clarifications.length}</strong></div>
      </div>
      <div className="clarifications-list">
        {clarifications.map((item: any) => {
          const isDone = item.status === "Resolved";
          return (
            <div className={`surface-card clarification-card ${isDone ? "done" : ""}`} key={item.id}>
              <div className="clarification-icon">
                {isDone ? <Check size={16} /> : <MessageCircleQuestion size={17} />}
              </div>
              <div className="clarification-copy">
                <div className="clarification-top">
                  <Badge tone={item.priority === "High" ? "rose" : "amber"}>{item.priority} priority</Badge>
                  <span>{item.category || "Business Logic"} · Project {projectId}</span>
                </div>
                <h3>{item.question}</h3>
                {item.answer ? (
                  <p style={{ color: "var(--mint)", fontWeight: 500 }}>Answer: {item.answer}</p>
                ) : (
                  <p>Awaiting clarification response from product owner.</p>
                )}
              </div>
              <div className="clarification-actions">
                <Button variant="secondary" onClick={() => {
                  const ans = window.prompt("Enter answer:", item.answer || "");
                  if (ans !== null) {
                    updateMutation.mutate({ id: item.id, status: "Resolved", answer: ans });
                    onToast("Clarification answered and resolved.");
                  }
                }}>
                  Answer
                </Button>
                <Button onClick={() => {
                  updateMutation.mutate({ id: item.id, status: isDone ? "Open" : "Resolved" });
                  onToast(isDone ? "Clarification reopened." : "Clarification resolved.");
                }}>
                  {isDone ? "Reopen" : "Resolve"}
                </Button>
              </div>
            </div>
          );
        })}
        {clarifications.length === 0 && (
          <div className="surface-card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No clarifications recorded for this project.
          </div>
        )}
      </div>
    </>
  );
}



function IssuesPage({ onToast }: { onToast: (message: string) => void }) {
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });
  const projectId = projectsList[0]?.id || 6;
  const queryClient = useQueryClient();

  const { data: issues = [] } = useQuery({
    queryKey: ["issues", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/issues?projectId=${projectId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    }
  });

  const categories = ["Ambiguity", "Conflict", "Missing Context", "Risk"];

  return (
    <>
      <PageHeader
        eyebrow="REQUIREMENT INTELLIGENCE"
        title="Requirement Issues"
        subtitle="Identify and resolve ambiguity, conflicts, missing information, and risks."
        action={
          <Button variant="secondary" onClick={() => onToast("Issues filtered.")}>
            <Filter size={15} /> Filter issues
          </Button>
        }
      />
      <div className="issue-category-grid">
        {categories.map((cat, i) => {
          const count = issues.filter((iss: any) => iss.category === cat || (cat === "Missing Context" && iss.category === "Missing Information")).length;
          return (
            <div className={`issue-category c${i}`} key={cat}>
              <span>{cat}</span>
              <strong>{count}</strong>
            </div>
          );
        })}
      </div>
      <section className="surface-card issue-list-card">
        <div className="card-heading compact">
          <div>
            <span className="card-kicker">ACTIVE RISK REGISTER</span>
            <h3>Issues that could slow development</h3>
          </div>
        </div>
        {issues.map((item: any) => (
          <div className="issue-row" key={item.id}>
            <div className={`issue-severity ${(item.severity || "medium").toLowerCase()}`}>
              {item.severity || "Medium"}
            </div>
            <div>
              <strong style={{ textDecoration: item.status === "Resolved" ? "line-through" : "none" }}>{item.title}</strong>
              <span>{item.category} · Status: {item.status}</span>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const newStatus = item.status === "Resolved" ? "Open" : "Resolved";
                updateMutation.mutate({ id: item.id, status: newStatus });
                onToast(`Issue marked as ${newStatus}.`);
              }}
            >
              {item.status === "Resolved" ? "Reopen issue" : "Resolve issue"} <ArrowRight size={14} />
            </Button>
          </div>
        ))}
        {issues.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No open requirement issues found.
          </div>
        )}
      </section>
    </>
  );
}


function RequirementReportsPage({ onToast }: { onToast: (message: string) => void }) {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE" title="Requirement Reports" subtitle="Create structured reports ready for stakeholders and development teams." action={<Button onClick={() => onToast("Requirement report builder opened.")}><Plus size={16} /> Create report</Button>} /><div className="report-highlight requirement-report-highlight"><div className="report-highlight-icon"><ShieldCheck size={21} /></div><div><span className="card-kicker">FROM VALIDATED PROBLEM TO DEVELOPMENT HANDOFF</span><h3>Preserve context all the way to the build team.</h3><p>Requirement reports include evidence, problem context, business rules, criteria, edge cases, issues, and readiness.</p></div><Button variant="dark" onClick={() => onToast("PDF export prepared.")}><Download size={15} /> Export latest</Button></div><div className="reports-grid">{["Retail Banking App", "E-Commerce Checkout", "Healthcare Appointment System"].map((name, i) => <div className="report-card surface-card" key={name}><div className="report-card-top"><div className={`report-type ${i === 0 ? "blue" : i === 1 ? "violet" : "mint"}`}><FileText size={19} /></div><Badge tone={i === 0 ? "amber" : "mint"}>{i === 0 ? "Needs clarification" : "Development ready"}</Badge></div><div className="card-kicker">REQUIREMENT REPORT · SEP {10 - i}</div><h3>{name}</h3><p>{["18 requirements · 91% confidence · 5 open clarifications", "12 requirements · 88% confidence · 4 open clarifications", "16 requirements · 94% confidence · 2 open clarifications"][i]}</p><div className="report-card-footer"><span><Clock3 size={13} /> Created {i ? `${i + 1} days ago` : "today"}</span><div><button onClick={() => onToast("Report opened.")}><ExternalLink size={15} /></button><button onClick={() => onToast("PDF export prepared.")}><Download size={15} /></button><button onClick={() => onToast("Share dialog opened.")}><Share2 size={15} /></button></div></div></div>)}</div></>;
}

function RequirementAnalyticsPage() {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · ANALYTICS" title="Requirement Intelligence" subtitle="Understand patterns, risks, and readiness across your requirements." action={<Button variant="secondary"><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></Button>} /><div className="intelligence-metrics"><div><span>Total requirements</span><strong>86</strong><small><TrendingUp size={12} /> 18% this period</small></div><div><span>Validated requirements</span><strong>42</strong><small><TrendingUp size={12} /> 49% of total</small></div><div><span>Development ready</span><strong>61</strong><small><TrendingUp size={12} /> 71% of total</small></div><div><span>Needs clarification</span><strong>14</strong><small className="muted">23% of total</small></div></div><div className="intelligence-grid"><section className="surface-card chart-card"><div className="card-heading compact"><div><span className="card-kicker">REQUIREMENT CONFIDENCE</span><h3>Readiness over time</h3></div></div><div className="chart-area"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-main"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 600 210" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="reqArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8268ef" stopOpacity=".24" /><stop offset="100%" stopColor="#8268ef" stopOpacity="0" /></linearGradient></defs><path d="M0 168 C55 160, 81 144, 122 150 S188 122, 220 128 S283 111, 315 117 S369 85, 410 93 S470 67, 510 76 S562 48, 600 55 L600 210 L0 210 Z" fill="url(#reqArea)" /><path d="M0 168 C55 160, 81 144, 122 150 S188 122, 220 128 S283 111, 315 117 S369 85, 410 93 S470 67, 510 76 S562 48, 600 55" fill="none" stroke="#8268ef" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>Aug 12</span><span>Aug 19</span><span>Aug 26</span><span>Sep 02</span><span>Sep 10</span></div></div></div></section><section className="surface-card recurring-card"><div className="card-heading compact"><div><span className="card-kicker">MOST COMMON RISKS</span><h3>What holds teams back</h3></div></div><div className="recurring-list">{[["Missing acceptance criteria", "18 requirements", 78, "rose"], ["Ambiguous scope", "14 requirements", 66, "amber"], ["Security gaps", "9 requirements", 54, "violet"], ["Unresolved conflicts", "5 requirements", 38, "blue"]].map(([name, count, value, color]) => <div className="recurring-row" key={name}><div className="recurring-row-head"><strong>{name}</strong><span>{count}</span></div><ProgressBar value={value as number} color={color as string} /></div>)}</div></section></div><section className="surface-card insights-list"><div className="card-heading compact"><div><span className="card-kicker">AI-GENERATED INSIGHTS</span><h3>The story across your requirements</h3></div></div>{["23% of requirements currently need clarification.", "Security requirements are frequently missing from early customer requests.", "Requirements with supporting customer evidence have higher confidence."].map((insight, index) => <div className="intelligence-insight" key={insight}><div className={`intelligence-insight-icon ${index === 0 ? "blue" : index === 1 ? "violet" : "mint"}`}><Sparkles size={15} /></div><div><strong>{insight}</strong><span>{index === 0 ? "Requirement workspace pattern" : index === 1 ? "Security category · 9 gaps" : "Evidence-backed requirements"}</span></div><ArrowRight size={15} /></div>)}</section></>;
}

function NotFoundPage({ navigate }: { navigate: (path: string) => void }) { return <div className="not-found"><Logo /><div className="not-found-icon"><HelpCircle size={30} /></div><h2>We couldn’t find that page.</h2><p>Try heading back to your discovery dashboard.</p><Button onClick={() => navigate("/dashboard")}>Back to dashboard <ArrowRight size={16} /></Button></div>; }

export default function App() {
  const [path, navigate] = useLocation();
  const [toast, setToast] = useState("");
  const showToast = (message: string) => setToast(message);
  const isPublic = path === "/" || path === "/signin" || path === "/signup";
  const content = useMemo(() => {
    if (path === "/") return <LandingPage navigate={navigate} />;
    if (path === "/signin") return <AuthPage mode="signin" navigate={navigate} />;
    if (path === "/signup") return <AuthPage mode="signup" navigate={navigate} />;
    if (path === "/dashboard") return <DashboardPage navigate={navigate} />;
    if (path === "/requirement-intelligence") return <RequirementDashboard navigate={navigate} onToast={showToast} />;
    if (path === "/requirement-analysis") return <RequirementAnalysisPage onToast={showToast} />;
    if (path === "/requirements-list") return <RequirementsListPage onToast={showToast} />;
    if (path === "/clarifications") return <ClarificationsPage onToast={showToast} />;
    if (path === "/requirement-issues") return <IssuesPage onToast={showToast} />;
    if (path === "/requirement-reports") return <RequirementReportsPage onToast={showToast} />;
    if (path === "/requirement-intelligence/analytics") return <RequirementAnalyticsPage />;
    if (path === "/discovery") return <DiscoveryPage onToast={showToast} />;
    if (path === "/projects") return <ProjectsPage navigate={navigate} onToast={showToast} />;
    if (path.startsWith("/projects/")) return <ProjectDetailPage navigate={navigate} onToast={showToast} />;
    if (path === "/discovery-requirements") return <RequirementsPage onToast={showToast} />;
    if (path === "/questions") return <QuestionsPage onToast={showToast} />;
    if (path === "/reports") return <ReportsPage onToast={showToast} />;
    if (path === "/intelligence") return <IntelligencePage onToast={showToast} />;
    if (path === "/settings") return <SettingsPage onToast={showToast} />;
    if (path === "/profile") return <ProfilePage navigate={navigate} onToast={showToast} />;
    return <NotFoundPage navigate={navigate} />;
  }, [path, navigate]);
  return <>{isPublic ? content : <AppShell path={path} navigate={navigate} onToast={showToast}>{content}</AppShell>}{toast && <Toast message={toast} onClose={() => setToast("")} />}</>;
}
