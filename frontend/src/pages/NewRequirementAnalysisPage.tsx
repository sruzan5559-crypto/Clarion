import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Lightbulb, Plus, Sparkles, Upload, Workflow } from "lucide-react";
import { Badge, Button, PageHeader, ProgressBar } from "../components/shared";
import { RequirementAnalysisResults } from "./RequirementAnalysisResults";

type FileState = { name: string; text: string; loading: boolean; error: string };

const defaultBusinessRequest = "Customers want to complete checkout faster. Returning users should not have to enter their delivery information every time. The checkout should remember their previous address and make the process much quicker.";
const sourceTypes = ["Customer Conversation", "Discovery Report", "Email", "Meeting Notes", "Business Request", "Document", "Manual Input"];

function RequirementLoading() {
  return <div className="analysis-loading requirement-loading"><div className="analysis-loading-orb"><Sparkles size={28} /></div><div className="eyebrow">CLARIVON AI · REQUIREMENT MODE</div><h2>Turning customer need into clarity.</h2><p>We are extracting what needs to be built, what is unclear, and what would make it ready for development.</p><div className="loading-progress"><ProgressBar value={62} color="violet" /><span>Analyzing requirements...</span></div></div>;
}

export function NewRequirementAnalysisPage({ onToast }: { onToast: (message: string) => void }) {
  const [source, setSource] = useState("Business Request");
  const [mode, setMode] = useState<"idle" | "loading" | "results">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [fileState, setFileState] = useState<FileState>({ name: "", text: "", loading: false, error: "" });
  const [inputs, setInputs] = useState<Record<string, string>>({
    "Customer Conversation": "",
    "Discovery Report": "",
    "Business Request": defaultBusinessRequest,
    "Email Subject": "",
    "Email Sender": "",
    "Email Body": "",
    "Meeting Title": "",
    "Meeting Date": "",
    "Meeting Participants": "",
    "Meeting Notes": "",
    "Requirement Title": "",
    "Requirement Description": "",
    "Business Objective": "",
    "User Actor": "",
    "Expected Behavior": "",
    Constraints: "",
    Priority: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not load projects.");
      return json.data || [];
    },
  });
  const { data: activeDiscovery } = useQuery({
    queryKey: ["activeAnalysis", selectedProjectId],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await fetch(`/api/analyses/active?projectId=${selectedProjectId}`);
      const json = await response.json();
      return json.success ? json.data : null;
    },
  });

  useEffect(() => {
    if (!selectedProjectId && projects.length) setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  const updateInput = (key: string, value: string) => setInputs((previous) => ({ ...previous, [key]: value }));
  const discoveryResult = activeDiscovery?.analysis_result;

  const useFindings = () => {
    if (!discoveryResult) {
      onToast("No saved discovery findings are available for this project.");
      return;
    }
    const findings = [
      `Customer goal: ${discoveryResult.goal || ""}`,
      `Stated problem: ${discoveryResult.statedProblems || discoveryResult.stated || ""}`,
      `Root problem: ${discoveryResult.rootProblems || discoveryResult.root || ""}`,
      `Evidence: ${(discoveryResult.evidence || []).map((item: any) => Array.isArray(item) ? item[0] : item.quote).join(" | ")}`,
      `Unanswered questions: ${(discoveryResult.followUpQuestions || discoveryResult.questions || []).map((item: any) => Array.isArray(item) ? item[0] : item.question).join(" | ")}`,
    ].join("\n\n");
    updateInput("Discovery Report", findings);
    setSource("Discovery Report");
    onToast("Validated discovery findings loaded.");
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("from") && discoveryResult) useFindings();
  }, [discoveryResult]);

  const handleProjectCreate = async () => {
    const name = window.prompt("Project name:");
    if (!name?.trim()) return;
    const customer = window.prompt("Customer name (optional):") || "";
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), customer: customer.trim() }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not create project.");
      setSelectedProjectId(json.data.id);
      onToast(`Project "${json.data.name}" created.`);
    } catch (projectError: any) {
      onToast(projectError?.message || "Could not create project.");
    }
  };

  const handleFile = async (file: File) => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".txt", ".md"].includes(extension)) {
      setFileState({ name: file.name, text: "", loading: false, error: "Use a PDF, DOCX, TXT, or MD file." });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileState({ name: file.name, text: "", loading: false, error: "The document must be smaller than 20 MB." });
      return;
    }
    setFileState({ name: file.name, text: "", loading: true, error: "" });
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("Could not read document."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/extract-file", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64Data: base64, fileName: file.name, mimeType: file.type }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Document extraction failed.");
      setFileState({ name: file.name, text: json.text, loading: false, error: "" });
      onToast(`Extracted ${json.wordCount} words from ${file.name}.`);
    } catch (fileError: any) {
      setFileState({ name: file.name, text: "", loading: false, error: fileError?.message || "Document extraction failed." });
    }
  };

  const contentForAnalysis = () => {
    if (source === "Customer Conversation") return inputs["Customer Conversation"];
    if (source === "Discovery Report") return inputs["Discovery Report"];
    if (source === "Email") return `Subject: ${inputs["Email Subject"]}\nSender: ${inputs["Email Sender"]}\n\n${inputs["Email Body"]}`;
    if (source === "Meeting Notes") return `Meeting: ${inputs["Meeting Title"]}\nDate: ${inputs["Meeting Date"]}\nParticipants: ${inputs["Meeting Participants"]}\n\n${inputs["Meeting Notes"]}`;
    if (source === "Document") return fileState.text;
    if (source === "Manual Input") return [`Requirement title: ${inputs["Requirement Title"]}`, `Description: ${inputs["Requirement Description"]}`, `Business objective: ${inputs["Business Objective"]}`, `User/actor: ${inputs["User Actor"]}`, `Expected behavior: ${inputs["Expected Behavior"]}`, `Constraints: ${inputs.Constraints}`, `Priority: ${inputs.Priority}`].join("\n");
    return inputs["Business Request"];
  };

  const runAnalysis = async () => {
    if (!selectedProjectId) {
      onToast("Select a project before analyzing requirements.");
      return;
    }
    const content = contentForAnalysis().trim();
    if (content.replace(/\b(Subject|Sender|Meeting|Date|Participants|Requirement title|Description|Business objective|User\/actor|Expected behavior|Constraints|Priority):?\s*/gi, "").trim().length < 12) {
      onToast("Add meaningful input before analyzing requirements.");
      return;
    }
    setMode("loading");
    setError("");
    try {
      const response = await fetch("/api/ai/requirements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: selectedProjectId, sourceType: source, content }) });
      const json = await response.json();
      if (!response.ok || !json.success || !json.data) throw new Error(json.error || "Requirement analysis failed.");
      setResult(json.data);
      setMode("results");
    } catch (analysisError: any) {
      setError(analysisError?.message || "Requirement analysis failed.");
      setMode("idle");
      onToast(analysisError?.message || "Requirement analysis failed.");
    }
  };

  if (mode === "loading") return <RequirementLoading />;
  if (mode === "results" && result) return <RequirementAnalysisResults result={result} projectId={selectedProjectId} text={contentForAnalysis()} onToast={onToast} onReset={() => setMode("idle")} />;

  const field = (label: string, key: string, placeholder: string, multiline = false) => <label className="requirement-input-field"><span>{label}</span>{multiline ? <textarea value={inputs[key] || ""} onChange={(event) => updateInput(key, event.target.value)} placeholder={placeholder} rows={5} /> : <input value={inputs[key] || ""} onChange={(event) => updateInput(key, event.target.value)} placeholder={placeholder} />}</label>;
  const project = projects.find((item: any) => item.id === selectedProjectId);
  return <><PageHeader eyebrow="NEW ANALYSIS · REQUIREMENT INTELLIGENCE" title="New Requirement Analysis" subtitle="Transform unstructured customer input into clear, actionable requirements." action={<div className="analysis-progress-pill"><span>STEP 01</span><strong>Capture business input</strong><span>of 04</span></div>} /><div className="analysis-layout"><main><div className="surface-card requirement-bridge"><div className="bridge-icon"><Workflow size={19} /></div><div><span className="card-kicker">CONNECTED TO CUSTOMER DISCOVERY</span><h3>Use validated discovery findings</h3><p>{discoveryResult ? "Import the saved goal, problems, evidence, and unanswered questions from this project." : "Run a Customer Discovery analysis first to make validated findings available here."}</p></div><Button variant="secondary" onClick={useFindings}><ArrowRight size={15} /> Use findings</Button></div><div className="surface-card project-picker"><div className="card-heading compact"><div><span className="card-kicker">PROJECT</span><h3>Where should we save this analysis?</h3></div><Button variant="secondary" onClick={handleProjectCreate}><Plus size={15} /> New project</Button></div><select className="form-select requirement-project-select" value={selectedProjectId || ""} onChange={(event) => setSelectedProjectId(Number(event.target.value))}><option value="">Select a project</option>{projects.map((item: any) => <option value={item.id} key={item.id}>{item.name} ({item.customer || "General"})</option>)}</select>{project && <span className="requirement-project-meta">{project.conversation_count || 0} conversations · {project.problem_count || 0} problems</span>}</div><div className="surface-card conversation-card"><div className="card-heading"><div><span className="card-kicker">CAPTURE BUSINESS VOICE</span><h3>What does the customer or business need?</h3><p>Choose a source and CLARIVON will convert it into development-ready requirements.</p></div><div className="conversation-count">{contentForAnalysis().length}<span>/ 10,000</span></div></div><div className="analysis-tabs">{sourceTypes.map((item) => <button type="button" className={source === item ? "active" : ""} key={item} onClick={() => setSource(item)}>{item}</button>)}</div><div className="requirement-source-content">{source === "Customer Conversation" && field("Customer conversation", "Customer Conversation", "Paste the raw customer conversation here...", true)}{source === "Discovery Report" && <div className="discovery-report-input"><div className="source-callout"><Sparkles size={15} /><span>{discoveryResult ? "Validated findings are available for this project." : "No validated findings are saved for this project yet."}</span></div>{field("Discovery findings", "Discovery Report", "Use findings above or paste a discovery report...", true)}</div>}{source === "Email" && <div className="requirement-form-grid">{field("Email subject", "Email Subject", "Issue with recurring transfers")}{field("Sender", "Email Sender", "customer@example.com")}{field("Email body", "Email Body", "Paste the customer email or request...", true)}</div>}{source === "Meeting Notes" && <div className="requirement-form-grid">{field("Meeting title", "Meeting Title", "Weekly product review")}{field("Date (optional)", "Meeting Date", "2026-09-11")}{field("Meeting participants (optional)", "Meeting Participants", "Product, engineering, support")}{field("Notes", "Meeting Notes", "Paste meeting notes here...", true)}</div>}{source === "Business Request" && field("Business request", "Business Request", "Describe the business need or request naturally...", true)}{source === "Document" && <div className="requirement-document-input"><input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" hidden onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])} /><div className="upload-zone" onClick={() => fileInputRef.current?.click()}><Upload size={22} /><strong>{fileState.loading ? "Extracting document..." : fileState.name || "Choose a document"}</strong><span>PDF, DOCX, TXT, or MD · up to 20 MB</span><Button variant="secondary" onClick={() => fileInputRef.current?.click()}>{fileState.loading ? "Processing..." : "Choose file"}</Button></div>{fileState.error && <div className="upload-error-banner"><AlertCircle size={15} />{fileState.error}</div>}{fileState.text && <div className="document-preview-box"><div className="preview-label">EXTRACTED CONTENT PREVIEW</div><div className="preview-content">{fileState.text}</div></div>}</div>}{source === "Manual Input" && <div className="requirement-form-grid">{field("Requirement title", "Requirement Title", "Remember returning customer information")}{field("Business objective", "Business Objective", "Reduce repetitive checkout effort")}{field("Requirement description", "Requirement Description", "Describe what should be built...", true)}{field("User / actor", "User Actor", "Returning customer")}{field("Expected behavior", "Expected Behavior", "Explain the successful outcome...", true)}{field("Constraints", "Constraints", "Security, compliance, performance...")}{field("Priority (optional)", "Priority", "High, Medium, or Low")}</div>}</div><div className="conversation-footer"><div><span className="input-tip"><Lightbulb size={14} /> Tip</span> Include specific behavior and constraints for stronger requirements.</div><Button onClick={runAnalysis} disabled={!selectedProjectId}><Sparkles size={16} /> Analyze requirements</Button></div>{error && <div className="upload-error-banner"><AlertCircle size={15} />{error}</div>}</div><div className="analysis-note requirement-note"><Sparkles size={16} /><div><strong>Requirement intelligence</strong><p>CLARIVON will extract functional and non-functional requirements, business rules, actors, acceptance criteria, ambiguity, risks, dependencies, edge cases, and clarification questions.</p></div></div></main><aside className="analysis-side"><div className="side-progress surface-card"><div className="side-progress-head"><strong>Requirement flow</strong><span>1 of 4</span></div><ProgressBar value={25} color="violet" /><div className="mini-flow"><div className="mini-flow-item active"><span>1</span><div><strong>Capture</strong><small>Add business input</small></div></div><div className="mini-flow-item"><span>2</span><div><strong>Analyze</strong><small>Extract requirements</small></div></div><div className="mini-flow-item"><span>3</span><div><strong>Clarify</strong><small>Resolve ambiguity</small></div></div><div className="mini-flow-item"><span>4</span><div><strong>Ready</strong><small>Prepare to build</small></div></div></div></div></aside></div></>;
}