import { useEffect, type ReactNode } from "react";
import { ArrowDown, CheckCircle2, TrendingUp, X } from "lucide-react";

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

export { Logo, Button, Badge, ProgressBar, Toast, PageHeader, StatCard, WorkflowVisualization };
