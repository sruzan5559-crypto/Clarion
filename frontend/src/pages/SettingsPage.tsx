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




export { SettingsPage };
