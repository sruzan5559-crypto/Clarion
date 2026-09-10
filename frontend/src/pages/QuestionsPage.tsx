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

export { QuestionsPage };
