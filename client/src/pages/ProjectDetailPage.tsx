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

function ProjectDetailPage({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  return <><button className="back-link" onClick={() => navigate("/projects")}><ArrowRight size={15} className="back-arrow" /> Back to projects</button><div className="project-detail-head"><div><div className="eyebrow">PROJECT · ACTIVE DISCOVERY</div><h2>Retail Banking App</h2><p>Helping FinBank customers transfer money with confidence.</p><div className="detail-meta"><span><Building2 size={14} /> FinBank</span><span><Clock3 size={14} /> Started Aug 12, 2026</span><span><Clock3 size={14} /> Updated 2 hours ago</span></div></div><div className="detail-actions"><Button variant="secondary" onClick={() => onToast("Project settings opened.")}><Settings size={15} /> Project settings</Button><Button onClick={() => navigate("/discovery")}><Sparkles size={15} /> New analysis</Button></div></div><div className="detail-stats"><div><span>Conversations</span><strong>8</strong><small>+2 this week</small></div><div><span>Problems discovered</span><strong>4</strong><small>3 high confidence</small></div><div><span>Questions generated</span><strong>22</strong><small>5 unanswered</small></div><div><span>Discovery confidence</span><strong>87%</strong><small>↑ 12% this month</small></div></div><section className="surface-card conversation-list"><div className="card-heading compact"><div><span className="card-kicker">RESEARCH LOG</span><h3>Customer conversations</h3></div><Button variant="secondary" onClick={() => navigate("/discovery")}><Plus size={15} /> Add conversation</Button></div><div className="conversation-list-head"><span>Conversation</span><span>Date</span><span>Status</span><span>Confidence</span><span /></div>{[["Mobile transfer friction", "FinBank customer #08", "Today", "Analyzed", "87%"], ["Card activation journey", "FinBank customer #07", "Sep 06, 2026", "Analyzed", "91%"], ["Receiving a payment", "FinBank customer #06", "Sep 02, 2026", "Analyzed", "82%"], ["International transfer", "FinBank customer #05", "Aug 28, 2026", "Needs review", "64%"]].map(row => <button className="conversation-row" key={row[0]} onClick={() => navigate("/discovery")}><div className="conversation-title"><div className="conversation-row-icon"><MessageSquareText size={15} /></div><div><strong>{row[0]}</strong><span>{row[1]}</span></div></div><span>{row[2]}</span><Badge tone={row[3] === "Analyzed" ? "mint" : "amber"}>{row[3]}</Badge><strong className="confidence-text">{row[4]}</strong><ChevronRight size={16} /></button>)}</section></>;
}



export { ProjectDetailPage };
