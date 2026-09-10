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

export { RequirementsPage };
