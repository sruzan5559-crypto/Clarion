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

export { Topbar };
