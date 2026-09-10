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


export { ReportsPage };
