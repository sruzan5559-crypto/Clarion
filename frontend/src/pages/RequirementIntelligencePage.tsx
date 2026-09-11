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

function ConfidenceRing({ value, label }: { value: number; label?: string }) {
  return <div className="confidence-wrap"><div className="confidence-ring"><div><strong>{value}</strong><span>%</span></div></div>{label && <span>{label}</span>}</div>;
}


const requirementData = {
  input: "Customers want to complete checkout faster. Returning users should not have to enter their delivery information every time. The checkout should remember their previous address and make the process much quicker.",
  requirement: "The system should allow returning customers to reuse previously entered delivery information during checkout.",
  evidence: "Returning users should not have to enter their delivery information every time.",
  questions: [
    ["Which customer information should be saved and reused during checkout?", "High", "Clarify data scope for REQ-001."],
    ["How long should saved delivery information remain available?", "High", "Define retention behavior."],
    ["Should customers be able to edit saved information before checkout?", "Medium", "Define the customer control point."],
    ["Should saved information be available across different devices?", "Medium", "Clarify account and device scope."],
  ],
};

function RequirementStats() {
  return <div className="requirement-stats"><StatCard label="Requirements analyzed" value="42" delta="8 this month" icon={FileText} accent="blue" /><StatCard label="Requirements extracted" value="86" delta="18 development-ready" icon={Sparkles} accent="violet" /><StatCard label="Ambiguities detected" value="14" delta="5 high severity" icon={AlertCircle} accent="amber" /><StatCard label="Clarifications needed" value="9" delta="3 blocking" icon={MessageCircleQuestion} accent="mint" /><StatCard label="Requirement confidence" value="91%" delta="↑ 6% this month" icon={Gauge} accent="blue" /></div>;
}

function RequirementWorkflow() {
  const stages = [["01", "Customer input", "Raw business voice"], ["02", "AI analysis", "Understand intent"], ["03", "Requirement extraction", "Find what to build"], ["04", "Classification", "Type and priority"], ["05", "Ambiguity check", "Find unclear language"], ["06", "Missing information", "Close context gaps"], ["07", "Conflict detection", "Keep it consistent"], ["08", "Clarifications", "Ask what matters"], ["09", "Acceptance criteria", "Make it testable"], ["10", "Development-ready", "Ready to build"]];
  return <div className="requirement-workflow">{stages.map(([number, title, subtitle], i) => <div className={`requirement-stage ${i === 2 ? "active" : i === 9 ? "ready" : ""}`} key={title}><span>{number}</span><strong>{title}</strong><small>{subtitle}</small>{i < stages.length - 1 && <ArrowDown size={14} />}</div>)}</div>;
}

function RequirementDashboard({ navigate, onToast }: { navigate: (path: string) => void; onToast: (message: string) => void }) {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · RETAIL BANKING APP" title="Requirement Intelligence" subtitle="Turn customer needs into clear, actionable, development-ready requirements." action={<Button onClick={() => navigate("/requirement-analysis")}><Sparkles size={16} /> New requirement analysis</Button>} /><RequirementStats /><div className="requirement-dashboard-grid"><section className="surface-card requirement-workflow-card"><div className="card-heading"><div><span className="card-kicker"><span className="live-dot" /> REQUIREMENT INTELLIGENCE WORKFLOW</span><h3>From validated problem to build-ready brief</h3><p>CLARIVON turns discovery evidence into requirements without losing the customer context behind them.</p></div><Badge tone="mint">91% confidence</Badge></div><RequirementWorkflow /><div className="workflow-footer"><div><span className="workflow-footer-dot" /> <strong>18 requirements</strong><span>from 8 discovery conversations</span></div><button className="text-button" onClick={() => navigate("/requirements-list")}>Review requirements <ArrowRight size={14} /></button></div></section><aside className="insight-card requirement-ai-card surface-card"><div className="insight-card-head"><div className="ai-orb"><Sparkles size={17} /></div><span>CLARIVON AI</span><span className="ai-status">Requirement mode</span></div><h3>What needs your attention</h3><div className="ai-callout"><div className="callout-number">01</div><p><strong>2 requirements are ambiguous.</strong> “Faster checkout” needs a measurable target.</p></div><div className="ai-callout"><div className="callout-number">02</div><p><strong>3 clarification questions</strong> should be answered before development.</p></div><button className="text-button" onClick={() => navigate("/clarifications")}>Review clarifications <ArrowRight size={14} /></button></aside></div><section className="surface-card recent-requirements"><div className="card-heading compact"><div><span className="card-kicker">KEEP THE HANDOFF MOVING</span><h3>Recent requirement analyses</h3></div><button className="text-button" onClick={() => navigate("/requirements-list")}>View all <ArrowRight size={14} /></button></div><div className="recent-requirement-grid">{[["Retail Banking App", "8 requirements", "92% confidence", "3 clarifications", "blue"], ["E-Commerce Checkout", "12 requirements", "88% confidence", "4 clarifications", "violet"], ["Healthcare Appointment System", "16 requirements", "94% confidence", "2 clarifications", "mint"]].map(([name, count, confidence, clarifications, tone]) => <button className="recent-requirement-card" key={name} onClick={() => navigate("/requirements-list")}><div className={`project-logo large ${tone}`}>{name.slice(0, 1)}</div><strong>{name}</strong><span>{count} · {confidence}</span><Badge tone={clarifications.startsWith("2") ? "mint" : "amber"}>{clarifications}</Badge><ArrowRight size={15} /></button>)}</div></section></>;
}

function RequirementAnalysisPage({ onToast }: { onToast: (message: string) => void }) {
  const [tab, setTab] = useState("Business Request");
  const [text, setText] = useState(requirementData.input);
  const [mode, setMode] = useState<"idle" | "loading" | "results">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const runAnalysis = async (input = text) => {
    if (!input.trim()) { onToast("Enter business input before analyzing."); return; }
    setMode("loading");
    setError("");
    try {
      const response = await fetch("/api/ai/requirements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: input }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Requirement analysis failed.");
      setResult(json.data);
      setMode("results");
    } catch (analysisError: any) {
      setError(analysisError?.message || "Requirement analysis failed.");
      setMode("idle");
      onToast(analysisError?.message || "Requirement analysis failed.");
    }
  };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("from")) {
      const findings = "Validated discovery findings: customers need a reliable way to transfer money independently.";
      setText(findings);
      void runAnalysis(findings);
    }
  }, []);
  if (mode === "loading") return <RequirementLoading />;
  if (mode === "results" && result) return <LiveRequirementResults result={result} text={text} onToast={onToast} onReset={() => setMode("idle")} />;
  return <><PageHeader eyebrow="NEW ANALYSIS · REQUIREMENT INTELLIGENCE" title="New Requirement Analysis" subtitle="Transform unstructured customer input into clear, actionable requirements." action={<div className="analysis-progress-pill"><span>STEP 01</span><strong>Capture business input</strong><span>of 04</span></div>} /><div className="analysis-layout"><main><div className="surface-card requirement-bridge"><div className="bridge-icon"><Workflow size={19} /></div><div><span className="card-kicker">CONNECTED TO CUSTOMER DISCOVERY</span><h3>Use validated discovery findings</h3><p>Start from the Retail Banking App problem we just validated: customers need a reliable way to transfer money independently.</p></div><Button variant="secondary" onClick={() => { setText("Validated problem: Customers lack a simple and reliable way to complete money transfers independently. Customer goal: Complete money transfers without support. Evidence: Customers retry multiple times and call support."); onToast("Customer discovery findings loaded into this analysis."); }}>Use findings <ArrowRight size={15} /></Button></div><div className="surface-card project-picker"><div className="card-heading compact"><div><span className="card-kicker">PROJECT</span><h3>Where should we save this analysis?</h3></div><Button variant="secondary" onClick={() => onToast("Project creation modal opened.")}><Plus size={15} /> New project</Button></div><div className="select-like"><div className="project-logo blue">R</div><div><strong>Retail Banking App</strong><span>FinBank · 18 requirements</span></div><ChevronDown size={17} /></div></div><div className="surface-card conversation-card"><div className="card-heading"><div><span className="card-kicker">CAPTURE BUSINESS VOICE</span><h3>What does the customer or business need?</h3><p>CLARIVON will distinguish facts, inferences, assumptions, ambiguities, and recommendations.</p></div><div className="conversation-count">{text.length}<span>/ 10,000</span></div></div><div className="analysis-tabs requirement-tabs">{["Customer Conversation", "Discovery Report", "Email", "Meeting Notes", "Business Request", "Document", "Manual Input"].map(item => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "Document" && <Upload size={14} />}{item}</button>)}</div>{tab === "Document" ? <div className="upload-zone"><div className="upload-icon"><Upload size={22} /></div><strong>Drop a document here</strong><span>PDF, DOCX, or TXT · up to 20 MB</span><Button variant="secondary" onClick={() => onToast("File picker opened.")}>Choose file</Button></div> : <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the customer requirement, business request, email, meeting notes, or discovery findings here..." />}{tab !== "Document" && <div className="conversation-footer"><div><span className="input-tip"><Lightbulb size={14} /> Tip</span> Include specific behavior and constraints for stronger requirements.</div><Button onClick={runAnalysis}><Sparkles size={16} /> Analyze requirements</Button></div>}</div><div className="analysis-note requirement-note"><Sparkles size={16} /><div><strong>From problem to requirement.</strong><p>We’ll turn the validated need into functional and non-functional requirements, business rules, acceptance criteria, edge cases, and a development-readiness check.</p></div></div></main><aside className="analysis-side"><div className="side-progress surface-card"><div className="side-progress-head"><strong>Requirement flow</strong><span>1 of 4</span></div><ProgressBar value={25} color="violet" /><div className="mini-flow"><div className="mini-flow-item active"><span><Check size={12} /></span><div><strong>Capture</strong><small>Add customer or business input</small></div></div><div className="mini-flow-item"><span>2</span><div><strong>Analyze</strong><small>Extract and classify</small></div></div><div className="mini-flow-item"><span>3</span><div><strong>Clarify</strong><small>Find gaps and conflicts</small></div></div><div className="mini-flow-item"><span>4</span><div><strong>Ready</strong><small>Prepare for development</small></div></div></div></div><div className="side-ai surface-card"><div className="insight-card-head"><div className="ai-orb"><Sparkles size={15} /></div><span>AI ASSISTANT</span></div><p>“A good requirement is not just a feature request. It is a clear, testable expression of the customer need—with its rules and edges intact.”</p><span className="ai-sig">— CLARIVON AI</span></div></aside></div></>;
}

function LiveRequirementResults({ result, projectId, text, onToast, onReset }: { result: any; projectId?: number | null; text: string; onToast: (message: string) => void; onReset: () => void }) {
  const [ready, setReady] = useState(false);
  return <div className="results-page requirement-results"><div className="results-top"><div><div className="eyebrow">ANALYSIS COMPLETE · REQUIREMENT INTELLIGENCE</div><h2>Here’s what should be built.</h2><p>Gemini/Groq connected the business need to actionable requirements and surfaced the remaining decisions.</p></div><div className="results-actions"><Button variant="secondary" onClick={onReset}><Pencil size={15} /> Edit input</Button><Button onClick={() => { setReady(true); onToast("Requirement is ready for development."); }}>{ready ? <Check size={15} /> : <ShieldCheck size={15} />} {ready ? "Development ready" : "Mark development ready"}</Button></div></div><div className="results-meta"><span><span className="live-dot" /> Real AI requirement analysis complete</span><span>{result.confidence}% confidence</span><span>{result.requirements.length} requirements</span></div><div className="results-grid"><div className="results-main"><section className="result-block accent-violet"><div className="result-label"><span className="result-num">01</span><div><span className="card-kicker">BUSINESS NEED</span><h3>What outcome needs to change?</h3></div><Badge tone="mint">{result.confidence}% confidence</Badge></div><p className="result-lead">{result.businessNeed}</p><div className="traceability-mini"><span>SOURCE INPUT</span><p>{text}</p></div></section>{result.requirements.map((item: any, index: number) => <section className="result-block requirement-card-highlight" key={`${item.title}-${index}`}><div className="result-label"><span className="result-num">{String(index + 2).padStart(2, "0")}</span><div><span className="card-kicker">{item.category.toUpperCase()} REQUIREMENT</span><h3>{item.title}</h3></div><Badge tone={item.priority === "High" ? "rose" : "amber"}>{item.priority}</Badge></div><p className="result-lead">{item.description}</p><div className="requirement-card-meta"><span>{item.confidence}% confidence</span></div></section>)}<section className="result-block"><div className="result-label"><span className="result-num">Q</span><div><span className="card-kicker">FOLLOW-UP QUESTIONS</span><h3>What still needs a decision?</h3></div></div>{result.followUpQuestions.map((question: string) => <p className="section-supporting" key={question}>{question}</p>)}</section></div><aside className="results-side"><div className="surface-card validation-card"><div className="card-kicker">QUALITY CHECK</div><h3>Analysis signals</h3><p>{result.ambiguities.length} ambiguities and {result.missingInformation.length} missing information items need review.</p></div></aside></div></div>;
}

function RequirementLoading() {
  return <div className="analysis-loading requirement-loading"><div className="analysis-loading-orb"><Sparkles size={28} /></div><div className="eyebrow">CLARIVON AI · REQUIREMENT MODE</div><h2>Turning customer need into clarity.</h2><p>We’re extracting what needs to be built, what is still unclear, and what would make it ready for development.</p><div className="loading-steps">{["Reading customer input", "Extracting requirements", "Classifying requirements", "Detecting ambiguity", "Checking missing information", "Detecting conflicts", "Identifying business rules", "Generating acceptance criteria", "Identifying edge cases", "Preparing development-ready requirements"].map((step, index) => <div className={`loading-step ${index < 5 ? "done" : index === 5 ? "current" : ""}`} key={step}><span>{index < 5 ? <Check size={13} /> : index === 5 ? <span className="loading-pulse" /> : <Circle size={12} />}</span>{step}{index < 5 && <small>complete</small>}</div>)}</div><div className="loading-progress"><ProgressBar value={69} color="violet" /><span>Almost done · checking requirement quality and readiness</span></div></div>;
}

function RequirementsListPage({ onToast }: { onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All");
  const rows = [["REQ-001", "Reuse customer address", "Functional", "High", "94%", "Validated"], ["REQ-002", "Allow address editing", "Functional", "High", "91%", "Development Ready"], ["REQ-003", "Protect saved address data", "Security", "High", "82%", "Needs Clarification"], ["REQ-004", "Address loads quickly", "Performance", "Medium", "78%", "Under Review"], ["REQ-005", "Remember multiple addresses", "UX", "Medium", "86%", "Draft"]];
  const shown = filter === "All" ? rows : rows.filter(r => r[2].toLowerCase().includes(filter.toLowerCase()) || r[5].toLowerCase().includes(filter.toLowerCase()));
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · WORKSPACE" title="Requirements" subtitle="Manage structured requirements across your projects." action={<Button onClick={() => onToast("New requirement analysis opened.")}><Plus size={16} /> New requirement</Button>} /><div className="toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search requirements..." /></div><Button variant="secondary"><Filter size={15} /> Filter <ChevronDown size={14} /></Button></div><div className="filter-tabs requirement-filter-tabs">{["All", "Functional", "Non-Functional", "Business Rules", "Security", "Needs Clarification", "Validated", "Development Ready"].map(item => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? 18 : shown.length}</span></button>)}</div><section className="surface-card requirement-table-card"><div className="requirement-table-head"><span>ID</span><span>Requirement</span><span>Type</span><span>Priority</span><span>Confidence</span><span>Status</span><span>Project</span><span>Updated</span></div>{shown.map(row => <div className="requirement-table-row" key={row[0]}><span className="req-id">{row[0]}</span><strong>{row[1]}</strong><span>{row[2]}</span><Badge tone={row[3] === "High" ? "rose" : "amber"}>{row[3]}</Badge><strong className="confidence-text">{row[4]}</strong><Badge tone={row[5] === "Development Ready" || row[5] === "Validated" ? "mint" : row[5] === "Needs Clarification" ? "rose" : "slate"}>{row[5]}</Badge><span>Retail Banking App</span><span className="updated-cell">Today</span></div>)}</section></>;
}


function ClarificationsPage({ onToast }: { onToast: (message: string) => void }) {
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

  const { data: clarifications = [] } = useQuery({
    queryKey: ["clarifications", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/clarifications?projectId=${projectId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, answer }: { id: number; status?: string; answer?: string }) => {
      const res = await fetch(`/api/clarifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, answer })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clarifications", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/clarifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          question: "Should guest users undergo email OTP verification before payment submission?",
          priority: "High",
          category: "Security"
        })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clarifications", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      onToast("Clarification question added.");
    }
  });
    <Button onClick={() => onToast("Requirement is ready for development.")}><ShieldCheck size={15} /> Mark development ready</Button>
  const openCount = clarifications.filter((c: any) => c.status === "Open").length;
  const resolvedCount = clarifications.filter((c: any) => c.status === "Resolved").length;

  return (
    <>
      <PageHeader
        eyebrow="REQUIREMENT INTELLIGENCE"
        title="Clarifications"
        subtitle="Resolve ambiguity before requirements reach development."
        action={
          <Button onClick={() => createMutation.mutate()}>
            <Plus size={16} /> Add clarification
          </Button>
        }
      />
      <div className="clarification-metrics">
        <div><span>Open questions</span><strong>{openCount}</strong></div>
        <div><span>Resolved questions</span><strong>{resolvedCount}</strong></div>
        <div><span>High priority</span><strong>{clarifications.filter((c: any) => c.priority === "High").length}</strong></div>
        <div><span>Total items</span><strong>{clarifications.length}</strong></div>
      </div>
      <div className="clarifications-list">
        {clarifications.map((item: any) => {
          const isDone = item.status === "Resolved";
          return (
            <div className={`surface-card clarification-card ${isDone ? "done" : ""}`} key={item.id}>
              <div className="clarification-icon">
                {isDone ? <Check size={16} /> : <MessageCircleQuestion size={17} />}
              </div>
              <div className="clarification-copy">
                <div className="clarification-top">
                  <Badge tone={item.priority === "High" ? "rose" : "amber"}>{item.priority} priority</Badge>
                  <span>{item.category || "Business Logic"} · Project {projectId}</span>
                </div>
                <h3>{item.question}</h3>
                {item.answer ? (
                  <p style={{ color: "var(--mint)", fontWeight: 500 }}>Answer: {item.answer}</p>
                ) : (
                  <p>Awaiting clarification response from product owner.</p>
                )}
              </div>
              <div className="clarification-actions">
                <Button variant="secondary" onClick={() => {
                  const ans = window.prompt("Enter answer:", item.answer || "");
                  if (ans !== null) {
                    updateMutation.mutate({ id: item.id, status: "Resolved", answer: ans });
                    onToast("Clarification answered and resolved.");
                  }
                }}>
                  Answer
                </Button>
                <Button onClick={() => {
                  updateMutation.mutate({ id: item.id, status: isDone ? "Open" : "Resolved" });
                  onToast(isDone ? "Clarification reopened." : "Clarification resolved.");
                }}>
                  {isDone ? "Reopen" : "Resolve"}
                </Button>
              </div>
            </div>
          );
        })}
        {clarifications.length === 0 && (
          <div className="surface-card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No clarifications recorded for this project.
          </div>
        )}
      </div>
    </>
  );
}



function IssuesPage({ onToast }: { onToast: (message: string) => void }) {
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

  const { data: issues = [] } = useQuery({
    queryKey: ["issues", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/issues?projectId=${projectId}`);
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    }
  });

  const categories = ["Ambiguity", "Conflict", "Missing Context", "Risk"];

  return (
    <>
      <PageHeader
        eyebrow="REQUIREMENT INTELLIGENCE"
        title="Requirement Issues"
        subtitle="Identify and resolve ambiguity, conflicts, missing information, and risks."
        action={
          <Button variant="secondary" onClick={() => onToast("Issues filtered.")}>
            <Filter size={15} /> Filter issues
          </Button>
        }
      />
      <div className="issue-category-grid">
        {categories.map((cat, i) => {
          const count = issues.filter((iss: any) => iss.category === cat || (cat === "Missing Context" && iss.category === "Missing Information")).length;
          return (
            <div className={`issue-category c${i}`} key={cat}>
              <span>{cat}</span>
              <strong>{count}</strong>
            </div>
          );
        })}
      </div>
      <section className="surface-card issue-list-card">
        <div className="card-heading compact">
          <div>
            <span className="card-kicker">ACTIVE RISK REGISTER</span>
            <h3>Issues that could slow development</h3>
          </div>
        </div>
        {issues.map((item: any) => (
          <div className="issue-row" key={item.id}>
            <div className={`issue-severity ${(item.severity || "medium").toLowerCase()}`}>
              {item.severity || "Medium"}
            </div>
            <div>
              <strong style={{ textDecoration: item.status === "Resolved" ? "line-through" : "none" }}>{item.title}</strong>
              <span>{item.category} · Status: {item.status}</span>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const newStatus = item.status === "Resolved" ? "Open" : "Resolved";
                updateMutation.mutate({ id: item.id, status: newStatus });
                onToast(`Issue marked as ${newStatus}.`);
              }}
            >
              {item.status === "Resolved" ? "Reopen issue" : "Resolve issue"} <ArrowRight size={14} />
            </Button>
          </div>
        ))}
        {issues.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No open requirement issues found.
          </div>
        )}
      </section>
    </>
  );
}


function RequirementReportsPage({ onToast }: { onToast: (message: string) => void }) {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE" title="Requirement Reports" subtitle="Create structured reports ready for stakeholders and development teams." action={<Button onClick={() => onToast("Requirement report builder opened.")}><Plus size={16} /> Create report</Button>} /><div className="report-highlight requirement-report-highlight"><div className="report-highlight-icon"><ShieldCheck size={21} /></div><div><span className="card-kicker">FROM VALIDATED PROBLEM TO DEVELOPMENT HANDOFF</span><h3>Preserve context all the way to the build team.</h3><p>Requirement reports include evidence, problem context, business rules, criteria, edge cases, issues, and readiness.</p></div><Button variant="dark" onClick={() => onToast("PDF export prepared.")}><Download size={15} /> Export latest</Button></div><div className="reports-grid">{["Retail Banking App", "E-Commerce Checkout", "Healthcare Appointment System"].map((name, i) => <div className="report-card surface-card" key={name}><div className="report-card-top"><div className={`report-type ${i === 0 ? "blue" : i === 1 ? "violet" : "mint"}`}><FileText size={19} /></div><Badge tone={i === 0 ? "amber" : "mint"}>{i === 0 ? "Needs clarification" : "Development ready"}</Badge></div><div className="card-kicker">REQUIREMENT REPORT · SEP {10 - i}</div><h3>{name}</h3><p>{["18 requirements · 91% confidence · 5 open clarifications", "12 requirements · 88% confidence · 4 open clarifications", "16 requirements · 94% confidence · 2 open clarifications"][i]}</p><div className="report-card-footer"><span><Clock3 size={13} /> Created {i ? `${i + 1} days ago` : "today"}</span><div><button onClick={() => onToast("Report opened.")}><ExternalLink size={15} /></button><button onClick={() => onToast("PDF export prepared.")}><Download size={15} /></button><button onClick={() => onToast("Share dialog opened.")}><Share2 size={15} /></button></div></div></div>)}</div></>;
}

function RequirementAnalyticsPage() {
  return <><PageHeader eyebrow="REQUIREMENT INTELLIGENCE · ANALYTICS" title="Requirement Intelligence" subtitle="Understand patterns, risks, and readiness across your requirements." action={<Button variant="secondary"><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></Button>} /><div className="intelligence-metrics"><div><span>Total requirements</span><strong>86</strong><small><TrendingUp size={12} /> 18% this period</small></div><div><span>Validated requirements</span><strong>42</strong><small><TrendingUp size={12} /> 49% of total</small></div><div><span>Development ready</span><strong>61</strong><small><TrendingUp size={12} /> 71% of total</small></div><div><span>Needs clarification</span><strong>14</strong><small className="muted">23% of total</small></div></div><div className="intelligence-grid"><section className="surface-card chart-card"><div className="card-heading compact"><div><span className="card-kicker">REQUIREMENT CONFIDENCE</span><h3>Readiness over time</h3></div></div><div className="chart-area"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-main"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 600 210" preserveAspectRatio="none" className="chart-svg"><defs><linearGradient id="reqArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8268ef" stopOpacity=".24" /><stop offset="100%" stopColor="#8268ef" stopOpacity="0" /></linearGradient></defs><path d="M0 168 C55 160, 81 144, 122 150 S188 122, 220 128 S283 111, 315 117 S369 85, 410 93 S470 67, 510 76 S562 48, 600 55 L600 210 L0 210 Z" fill="url(#reqArea)" /><path d="M0 168 C55 160, 81 144, 122 150 S188 122, 220 128 S283 111, 315 117 S369 85, 410 93 S470 67, 510 76 S562 48, 600 55" fill="none" stroke="#8268ef" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>Aug 12</span><span>Aug 19</span><span>Aug 26</span><span>Sep 02</span><span>Sep 10</span></div></div></div></section><section className="surface-card recurring-card"><div className="card-heading compact"><div><span className="card-kicker">MOST COMMON RISKS</span><h3>What holds teams back</h3></div></div><div className="recurring-list">{[["Missing acceptance criteria", "18 requirements", 78, "rose"], ["Ambiguous scope", "14 requirements", 66, "amber"], ["Security gaps", "9 requirements", 54, "violet"], ["Unresolved conflicts", "5 requirements", 38, "blue"]].map(([name, count, value, color]) => <div className="recurring-row" key={name}><div className="recurring-row-head"><strong>{name}</strong><span>{count}</span></div><ProgressBar value={value as number} color={color as string} /></div>)}</div></section></div><section className="surface-card insights-list"><div className="card-heading compact"><div><span className="card-kicker">AI-GENERATED INSIGHTS</span><h3>The story across your requirements</h3></div></div>{["23% of requirements currently need clarification.", "Security requirements are frequently missing from early customer requests.", "Requirements with supporting customer evidence have higher confidence."].map((insight, index) => <div className="intelligence-insight" key={insight}><div className={`intelligence-insight-icon ${index === 0 ? "blue" : index === 1 ? "violet" : "mint"}`}><Sparkles size={15} /></div><div><strong>{insight}</strong><span>{index === 0 ? "Requirement workspace pattern" : index === 1 ? "Security category · 9 gaps" : "Evidence-backed requirements"}</span></div><ArrowRight size={15} /></div>)}</section></>;
}


export { RequirementDashboard, RequirementAnalysisPage, LiveRequirementResults, RequirementsListPage, ClarificationsPage, IssuesPage, RequirementReportsPage, RequirementAnalyticsPage };
