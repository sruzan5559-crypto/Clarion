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


export { DashboardPage };
