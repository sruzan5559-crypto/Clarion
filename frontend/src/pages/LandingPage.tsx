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

const workflowSteps = [
  ["Conversation", "Customer voice", MessageSquareText],
  ["Goal", "What they want", Target],
  ["Stated problem", "What they say", AlertCircle],
  ["Root problem", "What may be underneath", Lightbulb],
  ["Evidence", "What supports it", ShieldCheck],
  ["Questions", "What to ask next", MessageCircleQuestion],
  ["Validation", "How confident to be", Gauge],
] as const;

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

export { LandingPage };
