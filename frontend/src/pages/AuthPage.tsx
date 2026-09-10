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

function AuthPage({ mode, navigate }: { mode: "signin" | "signup"; navigate: (path: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  return <div className="auth-page"><div className="auth-poster"><div className="auth-poster-inner"><Logo light /><div className="auth-poster-copy"><div className="eyebrow light-eyebrow">CUSTOMER DISCOVERY INTELLIGENCE</div><h1>Discover the <em>real problem.</em></h1><p>Turn customer conversations into clear, evidence-backed problem insights.</p><div className="auth-flow"><span>Conversation</span><ArrowRight size={14} /><span>AI Analysis</span><ArrowRight size={14} /><span>Problem Discovery</span><ArrowRight size={14} /><span>Validation</span></div></div><div className="auth-poster-bottom"><span>✦</span><span>Understand the problem before you build the solution.</span></div></div></div><div className="auth-panel"><button className="auth-back" onClick={() => navigate("/")}><ArrowRight size={16} className="back-arrow" /> Back to home</button><div className="auth-card"><div className="auth-heading"><div className="auth-mark"><Sparkles size={17} /></div><h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2><p>{mode === "signin" ? "Pick up where you left off in your discovery work." : "Start turning conversations into conviction."}</p></div><form onSubmit={(e) => { e.preventDefault(); navigate("/dashboard"); }} className="auth-form">{mode === "signup" && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></label>}<label>Email<input type="email" placeholder="you@company.com" /></label><label>Password<div className="password-input"><input type={showPassword ? "text" : "password"} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>{mode === "signup" && <label>Role<select defaultValue="product"><option value="product">Product Manager</option><option value="founder">Founder</option><option value="designer">Designer</option><option value="researcher">Researcher</option><option value="analyst">Business Analyst</option></select></label>}{mode === "signin" && <div className="auth-options"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div>}<Button type="submit" className="full-width">{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={16} /></Button></form><div className="divider"><span>OR</span></div><Button variant="secondary" className="full-width google-btn" onClick={() => navigate("/dashboard")}><span className="google-g">G</span> Continue with Google</Button><p className="auth-switch">{mode === "signin" ? "Don't have an account?" : "Already have an account?"} <button onClick={() => navigate(mode === "signin" ? "/signup" : "/signin")}>{mode === "signin" ? "Create account" : "Sign in"}</button></p></div><p className="auth-legal">By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p></div></div>;
}

export { AuthPage };
