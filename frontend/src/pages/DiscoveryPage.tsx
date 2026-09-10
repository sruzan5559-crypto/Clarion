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

const analysisData = {
  goal: "The customer wants to transfer money quickly and independently without needing customer support.",
  stated: "The customer finds the money transfer process difficult and unreliable.",
  root: "Customers lack a simple and reliable way to complete money transfers independently.",
  rootExplanation: "The deeper issue appears to be reliability and confidence in completing the transfer independently, rather than simply the number of steps in the process.",
  evidence: [
    ["“I usually have to try multiple times.”", "Supports repeated failure and process friction."],
    ["“Sometimes I just call customer support.”", "Indicates the customer is unable to complete the task independently."],
  ],
  symptoms: ["Multiple failed attempts", "Repeated retries", "Long completion time", "Confusing navigation", "Customer support dependency"],
  questions: [
    ["Can you walk me through the last time you tried to transfer money?", "High", "Understand the actual customer journey."],
    ["Which step of the transfer process is most difficult for you?", "High", "Isolate the specific friction point."],
    ["What do you normally do when the transfer does not work?", "High", "Understand the current workaround."],
    ["How frequently does this happen?", "Medium", "Understand the scale of the problem."],
  ],
};

function NewProjectModal({
  isOpen,
  onClose,
  onSuccess,
  onToast
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProj: any) => void;
  onToast: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; customer?: string }>({});

  const createMutation = useMutation({
    mutationFn: async (newProj: { name: string; customer: string; description?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProj)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create project");
      }
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onToast(`Project "${data.name}" created successfully.`);
      onSuccess(data);
      setName("");
      setCustomer("");
      setDescription("");
      setErrors({});
      onClose();
    },
    onError: (err: any) => {
      onToast(`Error creating project: ${err?.message || "Server error"}`);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; customer?: string } = {};
    if (!name.trim()) newErrors.name = "Project name is required.";
    if (!customer.trim()) newErrors.customer = "Customer name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate({ name: name.trim(), customer: customer.trim(), description: description.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Project Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Mobile Banking Refresh"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                Customer / Client Name <span className="required-star">*</span>
              </label>
              <input
                className={`form-input ${errors.customer ? "error" : ""}`}
                placeholder="e.g. FinBank Global"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (errors.customer) setErrors((prev) => ({ ...prev, customer: undefined }));
                }}
              />
              {errors.customer && <span className="form-error-msg">{errors.customer}</span>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe the project scope or research goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AIAssistantSidebar({
  projectId,
  currentStep,
  analysisResult
}: {
  projectId: number;
  currentStep: number;
  analysisResult: any;
}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ai-guidance", projectId, currentStep, Boolean(analysisResult)],
    queryFn: async () => {
      const res = await fetch("/api/ai-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          step: currentStep,
          analysisResult
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load AI guidance");
      return json.data;
    },
    staleTime: 20000
  });

  return (
    <div className="side-ai surface-card">
      <div className="insight-card-head">
        <div className="ai-orb">
          <Sparkles size={15} />
        </div>
        <span>AI ASSISTANT</span>
      </div>

      {isLoading ? (
        <div className="ai-guidance-skeleton">
          <div className="skeleton-line" style={{ width: "95%" }} />
          <div className="skeleton-line" style={{ width: "80%" }} />
          <div className="skeleton-line" style={{ width: "65%" }} />
        </div>
      ) : isError ? (
        <div className="ai-guidance-error">
          <span>{(error as any)?.message || "Guidance error"}</span>
          <Button variant="ghost" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !data?.guidance ? (
        <div className="ai-guidance-empty">No guidance available for this step.</div>
      ) : (
        <>
          <p>“{data.guidance}”</p>
          <span className="ai-sig">— CLARIVON AI</span>
        </>
      )}
    </div>
  );
}

function DiscoveryPage({ onToast }: { onToast: (message: string) => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Conversation");
  const [tabInputs, setTabInputs] = useState<Record<string, string>>({
    Conversation: "I spend too much time trying to transfer money through the mobile app. I usually have to try multiple times, and sometimes I just call customer support.",
    "Interview Notes": "Interviewer: What issue did you run into during transfer?\nUser: Every time I enter recipient details and click Send, it spins for 30 seconds and fails with a generic error.",
    Email: "From: customer@finbank.com\nSubject: Issues with recurring transfer setup\nHi Team,\nWe tried setting up automated weekly transfers for our vendor account, but the system keeps throwing Error 502 without saving the scheduled date. Can you fix this urgently?",
    "Meeting Notes": "Meeting Title: Weekly Operations Review\nDate: Sept 10\nKey takeaway: Customers are reporting delays in confirmation emails after completing checkout. Support volume is up 25% due to double payments.",
    "Upload Document": ""
  });

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    text: string;
    wordCount: number;
    status: "idle" | "uploading" | "success" | "error";
    errorMessage?: string;
    progress: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "results">("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [questionCopied, setQuestionCopied] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real projects from DB
  const { data: projectsList = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch projects");
      return json.data || [];
    }
  });

  // Set default selected project
  useEffect(() => {
    if (!selectedProjectId && projectsList.length > 0) {
      setSelectedProjectId(projectsList[0].id);
    }
  }, [projectsList, selectedProjectId]);

  const activeProject = useMemo(() => {
    return projectsList.find((p: any) => p.id === selectedProjectId) || projectsList[0];
  }, [projectsList, selectedProjectId]);

  // Fetch active analysis for selected project
  const { data: activeAnalysis } = useQuery({
    queryKey: ["activeAnalysis", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const res = await fetch(`/api/analyses/active?projectId=${selectedProjectId}`);
      const json = await res.json();
      return json.data || null;
    },
    enabled: Boolean(selectedProjectId)
  });

  // Sync state with active analysis from DB
  useEffect(() => {
    if (activeAnalysis) {
      if (activeAnalysis.current_step) {
        setCurrentStep(activeAnalysis.current_step);
      }
      if (activeAnalysis.analysis_result) {
        setAnalysisResult(activeAnalysis.analysis_result);
        setStatus(activeAnalysis.status === "analyzing" ? "loading" : "results");
        setSaved(activeAnalysis.status !== "failed");
        if (activeAnalysis.rawInput) {
          setTabInputs((previous) => ({ ...previous, [activeAnalysis.inputType || "Conversation"]: activeAnalysis.rawInput }));
        }
      } else {
        setAnalysisResult(null);
        setStatus(activeAnalysis.status === "analyzing" ? "loading" : "idle");
        setSaved(false);
      }
    }
  }, [activeAnalysis]);

  // Mutation to save step change to DB
  const updateStepMutation = useMutation({
    mutationFn: async (step: number) => {
      if (!selectedProjectId) return;
      await fetch("/api/analyses/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, step })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAnalysis", selectedProjectId] });
    }
  });

  const handleStepClick = (step: number) => {
    if (step > currentStep) {
      onToast("Complete the current discovery step before moving forward.");
      return;
    }
    setCurrentStep(step);
    if (selectedProjectId) {
      updateStepMutation.mutate(step);
    }
  };

  const processFile = async (file: File) => {
    const allowedExts = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExts.includes(ext)) {
      const errorMsg = `Unsupported file format "${ext}". Please upload PDF, DOCX, or TXT.`;
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      const errorMsg = "File size exceeds 20MB limit.";
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      text: "",
      wordCount: 0,
      status: "uploading",
      progress: 30
    });

    try {
      if (ext === ".txt") {
        const text = await file.text();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        setUploadedFile({
          name: file.name,
          size: file.size,
          text,
          wordCount,
          status: "success",
          progress: 100
        });
        setTabInputs((prev) => ({ ...prev, "Upload Document": text }));
        onToast(`Extracted ${wordCount} words from ${file.name}`);
      } else {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.split(",")[1] || res;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setUploadedFile((prev) => (prev ? { ...prev, progress: 65 } : null));

        const resp = await fetch("/api/extract-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data,
            fileName: file.name,
            mimeType: file.type
          })
        });

        const json = await resp.json();
        if (!json.success) {
          throw new Error(json.error || "Failed to extract document content.");
        }

        setUploadedFile({
          name: file.name,
          size: file.size,
          text: json.text,
          wordCount: json.wordCount,
          status: "success",
          progress: 100
        });
        setTabInputs((prev) => ({ ...prev, "Upload Document": json.text }));
        onToast(`Extracted ${json.wordCount} words from ${file.name}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to process document.";
      setUploadedFile({
        name: file.name,
        size: file.size,
        text: "",
        wordCount: 0,
        status: "error",
        errorMessage: errorMsg,
        progress: 100
      });
      onToast(errorMsg);
    }
  };

  const analyze = async () => {
    let contentToAnalyze = "";
    if (tab === "Upload Document") {
      contentToAnalyze = uploadedFile?.text || "";
    } else {
      contentToAnalyze = tabInputs[tab] || "";
    }

    if (!selectedProjectId) {
      onToast("Select a project before analyzing.");
      return;
    }

    if (!contentToAnalyze.trim()) {
      if (tab === "Upload Document") {
        onToast("Please upload a PDF, DOCX, or TXT document first.");
      } else {
        onToast(`Please enter ${tab.toLowerCase()} text before analyzing.`);
      }
      return;
    }

    setStatus("loading");
    setCurrentStep(2);

    try {
      const resp = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          inputType: tab,
          content: contentToAnalyze,
          fileName: tab === "Upload Document" ? uploadedFile?.name : undefined
        })
      });

      const json = await resp.json();
      if (!json.success) {
        throw new Error(json.error || "AI analysis server error.");
      }

      if (!resp.ok || !json.success) {
        throw new Error(json.error || `Analysis request failed (${resp.status}).`);
      }

      const resultData = json.data.analysisResult;
      setAnalysisResult(resultData);
      setStatus("results");
      setSaved(true);
      setCurrentStep(json.data.currentStep || 3);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["activeAnalysis", selectedProjectId] });
    } catch (err: any) {
      setStatus("idle");
      onToast(`Analysis error: ${err?.message || "Could not connect to analysis service."}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="analysis-loading">
        <div className="analysis-loading-orb">
          <Sparkles size={28} />
        </div>
        <div className="eyebrow">CLARIVON AI · LIVE ANALYSIS</div>
        <h2>Listening for what’s underneath.</h2>
        <p>We’re moving from the customer’s words to a clearer understanding of the problem.</p>
        <div className="loading-steps">
          {[
            "Reading customer statements",
            "Identifying customer goals",
            "Detecting stated problems",
            "Separating symptoms from root causes",
            "Detecting assumptions & evidence",
            "Finding missing context & conflicts",
            "Extracting requirements"
          ].map((step, index) => (
            <div className={`loading-step ${index < 5 ? "done" : index === 5 ? "current" : ""}`} key={step}>
              <span>{index < 5 ? <Check size={13} /> : index === 5 ? <span className="loading-pulse" /> : <Circle size={12} />}</span>
              {step}
              {index < 5 && <small>complete</small>}
            </div>
          ))}
        </div>
        <div className="loading-progress">
          <ProgressBar value={82} color="violet" />
          <span>Almost done · finalizing structured intelligence report</span>
        </div>
      </div>
    );
  }

  if (status === "results" && analysisResult && currentStep > 1) {
    return (
      <AnalysisResults
        data={analysisResult}
        projectId={selectedProjectId}
        currentStep={currentStep}
        rawInput={tab === "Upload Document" ? uploadedFile?.text || "" : tabInputs[tab] || ""}
        saved={saved}
        setSaved={setSaved}
        questionCopied={questionCopied}
        setQuestionCopied={setQuestionCopied}
        onToast={onToast}
        onWorkflowUpdated={(updated) => {
          setAnalysisResult(updated.analysisResult);
          setCurrentStep(updated.currentStep);
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          queryClient.invalidateQueries({ queryKey: ["activeAnalysis", selectedProjectId] });
        }}
        onReset={() => {
          setStatus("idle");
          setCurrentStep(1);
          if (selectedProjectId) {
            updateStepMutation.mutate(1);
          }
        }}
      />
    );
  }

  const currentLength = (tab === "Upload Document" ? uploadedFile?.text.length : tabInputs[tab]?.length) || 0;

  const placeholders: Record<string, string> = {
    Conversation: "Paste the customer conversation transcript here (e.g. Customer: I tried sending $500 to my account... Agent: What happened next?)...",
    "Interview Notes": "Paste structured interview notes here (e.g. Participant #4: Struggles with multi-factor authentication delays during high load)...",
    Email: "Paste customer email, support message, or feedback ticket here...",
    "Meeting Notes": "Paste meeting minutes, call transcripts, or team sync notes here..."
  };

  const stepTitles: Record<number, string> = {
    1: "Capture conversation",
    2: "Analyze signals",
    3: "Discover root problem",
    4: "Validate questions"
  };

  return (
    <>
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={(newProj) => {
          setSelectedProjectId(newProj.id);
        }}
        onToast={onToast}
      />

      <PageHeader
        eyebrow={`NEW ANALYSIS · ${(activeProject?.name || "RETAIL BANKING APP").toUpperCase()}`}
        title="New customer discovery analysis"
        subtitle="Analyze a customer conversation and uncover the problem behind what they said."
        action={
          <div className="analysis-progress-pill">
            <span>STEP 0{currentStep}</span>
            <strong>{stepTitles[currentStep] || "Capture conversation"}</strong>
            <span>of 04</span>
          </div>
        }
      />
      <div className="analysis-layout">
        <main>
          <div className="surface-card project-picker">
            <div className="card-heading compact">
              <div>
                <span className="card-kicker">PROJECT</span>
                <h3>Where should we save this analysis?</h3>
              </div>
              <Button variant="secondary" onClick={() => setIsNewProjectModalOpen(true)}>
                <Plus size={15} /> New project
              </Button>
            </div>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <select
                className="form-select"
                style={{ fontSize: "14px", fontWeight: "600", padding: "12px 14px", borderRadius: "12px" }}
                value={selectedProjectId || ""}
                onChange={(e) => {
                  if (e.target.value === "__NEW__") {
                    setIsNewProjectModalOpen(true);
                  } else {
                    setSelectedProjectId(Number(e.target.value));
                  }
                }}
              >
                {projectsList.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.customer || "General"}) — {p.conversation_count || 0} conversation{p.conversation_count === 1 ? "" : "s"}
                  </option>
                ))}
                <option value="__NEW__">+ Create New Project...</option>
              </select>
            </div>
          </div>

          <div className="surface-card conversation-card">
            <div className="card-heading">
              <div>
                <span className="card-kicker">CAPTURE CUSTOMER VOICE</span>
                <h3>What did the customer say?</h3>
                <p>Start with their words. CLARIVON will help you separate the signal from the noise.</p>
              </div>
              <div className="conversation-count">
                {currentLength}
                <span>/ 10,000</span>
              </div>
            </div>

            <div className="analysis-tabs">
              {["Conversation", "Interview Notes", "Email", "Meeting Notes", "Upload Document"].map((item) => (
                <button
                  key={item}
                  className={tab === item ? "active" : ""}
                  onClick={() => setTab(item)}
                >
                  {item === "Upload Document" && <Upload size={14} />}
                  {item}
                </button>
              ))}
            </div>

            {tab === "Upload Document" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                  }}
                />

                {!uploadedFile ? (
                  <div
                    className={`upload-zone ${isDragging ? "dragging" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <div className="upload-icon">
                      <Upload size={22} />
                    </div>
                    <strong>Drop a document here</strong>
                    <span>PDF, DOCX, or TXT · up to 20 MB</span>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Choose file
                    </Button>
                  </div>
                ) : (
                  <div className="uploaded-file-card">
                    <div className="uploaded-file-head">
                      <div className="uploaded-file-info">
                        <FileText size={22} className="file-icon" />
                        <div>
                          <strong>{uploadedFile.name}</strong>
                          <span>
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · {uploadedFile.wordCount ? `${uploadedFile.wordCount} words` : "Processing"}
                          </span>
                        </div>
                      </div>
                      <div className="uploaded-file-actions">
                        <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
                          Replace
                        </Button>
                        <Button
                          variant="ghost"
                          className="danger-text"
                          onClick={() => {
                            setUploadedFile(null);
                            setTabInputs((prev) => ({ ...prev, "Upload Document": "" }));
                          }}
                        >
                          <Trash2 size={15} /> Remove
                        </Button>
                      </div>
                    </div>

                    {uploadedFile.status === "uploading" && (
                      <div className="upload-progress-wrap">
                        <ProgressBar value={uploadedFile.progress} color="blue" />
                        <span>Extracting document text... {uploadedFile.progress}%</span>
                      </div>
                    )}

                    {uploadedFile.status === "error" && (
                      <div className="upload-error-banner">
                        <AlertCircle size={16} />
                        <span>{uploadedFile.errorMessage || "Document parsing failed."}</span>
                      </div>
                    )}

                    {uploadedFile.status === "success" && (
                      <div className="document-preview-box">
                        <div className="preview-label">EXTRACTED CONTENT PREVIEW</div>
                        <div className="preview-content">{uploadedFile.text}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={tabInputs[tab] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setTabInputs((prev) => ({ ...prev, [tab]: val }));
                }}
                placeholder={placeholders[tab] || "Paste customer input here..."}
              />
            )}

            <div className="conversation-footer">
              <div>
                <span className="input-tip">
                  <Lightbulb size={14} /> Tip
                </span>
                Include the customer’s exact words for stronger evidence.
              </div>
              <Button onClick={analyze} disabled={!selectedProjectId}>
                <Sparkles size={16} /> Analyze with AI
              </Button>
            </div>
          </div>

          <div className="analysis-note">
            <Sparkles size={16} />
            <div>
              <strong>This is more than summarization.</strong>
              <p>CLARIVON will identify goals, stated and root problems, symptoms, assumptions, evidence, missing context, conflicts, requirements, and follow-up questions.</p>
            </div>
          </div>
        </main>

        <aside className="analysis-side">
          <div className="side-progress surface-card">
            <div className="side-progress-head">
              <strong>Discovery flow</strong>
              <span>{currentStep} of 4</span>
            </div>
            <ProgressBar value={currentStep * 25} color="blue" />
            <div className="mini-flow">
              <div
                className={`mini-flow-item ${currentStep >= 1 ? "active" : ""}`}
                style={{ cursor: currentStep >= 1 ? "pointer" : "default" }}
                onClick={() => handleStepClick(1)}
              >
                <span>{currentStep > 1 ? <Check size={12} /> : "1"}</span>
                <div>
                  <strong>Capture</strong>
                  <small>Add customer voice</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 2 ? "active" : ""}`}
                style={{ cursor: currentStep >= 2 ? "pointer" : "default" }}
                onClick={() => handleStepClick(2)}
              >
                <span>{currentStep > 2 ? <Check size={12} /> : "2"}</span>
                <div>
                  <strong>Analyze</strong>
                  <small>Find patterns and signals</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 3 ? "active" : ""}`}
                style={{ cursor: currentStep >= 3 ? "pointer" : "default" }}
                onClick={() => handleStepClick(3)}
              >
                <span>{currentStep > 3 ? <Check size={12} /> : "3"}</span>
                <div>
                  <strong>Discover</strong>
                  <small>Move below the surface</small>
                </div>
              </div>
              <div
                className={`mini-flow-item ${currentStep >= 4 ? "active" : ""}`}
                style={{ cursor: currentStep >= 4 ? "pointer" : "default" }}
                onClick={() => handleStepClick(4)}
              >
                <span>{currentStep >= 4 ? <Check size={12} /> : "4"}</span>
                <div>
                  <strong>Validate</strong>
                  <small>Know what to ask next</small>
                </div>
              </div>
            </div>
          </div>

          <AIAssistantSidebar
            projectId={selectedProjectId || 1}
            currentStep={currentStep}
            analysisResult={analysisResult}
          />
        </aside>
      </div>
    </>
  );
}

function ConfidenceRing({ value, label }: { value: number; label?: string }) {
  return <div className="confidence-wrap"><div className="confidence-ring"><div><strong>{value}</strong><span>%</span></div></div>{label && <span>{label}</span>}</div>;
}

function AnalysisResults({
  data,
  projectId,
  currentStep,
  rawInput,
  saved,
  setSaved,
  questionCopied,
  setQuestionCopied,
  onToast,
  onWorkflowUpdated,
  onReset,
}: {
  data: any;
  projectId: number | null;
  currentStep: number;
  rawInput: string;
  saved: boolean;
  setSaved: (v: boolean) => void;
  questionCopied: boolean;
  setQuestionCopied: (v: boolean) => void;
  onToast: (message: string) => void;
  onWorkflowUpdated: (data: any) => void;
  onReset: () => void;
}) {
  const [review, setReview] = useState({
    goal: data?.goal || "",
    statedProblems: data?.statedProblems || data?.stated || "",
    rootProblems: data?.rootProblems || data?.root || "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const submitValidation = async (decision: "confirmed" | "rejected") => {
    if (!projectId) return;
    setIsValidating(true);
    try {
      const response = await fetch("/api/analyses/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, decision, answers, findings: review }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || `Validation failed (${response.status}).`);
      onWorkflowUpdated(json.data);
      onToast(decision === "confirmed" ? "Findings confirmed and saved." : "Findings marked for revision.");
    } catch (error: any) {
      onToast(error?.message || "Could not save validation.");
    } finally {
      setIsValidating(false);
    }
  };

  const copyQuestions = () => {
    if (data?.questions) {
      navigator.clipboard?.writeText(data.questions.map((q: any, i: number) => `${i + 1}. ${q[0]}`).join("\n"));
      setQuestionCopied(true);
      onToast("Questions copied to clipboard.");
    }
  };

  const validation = data?.validation || {
    confidence: 87,
    evidenceScore: 92,
    clarityScore: 85,
    completenessScore: 78,
    summary: "Strong customer evidence detected."
  };

  return (
    <div className="results-page">
      <div className="results-top">
        <div>
          <div className="eyebrow">ANALYSIS COMPLETE · {data?.inputType?.toUpperCase() || "CUSTOMER VOICE"}</div>
          <h2>Here’s what we heard.</h2>
          <p>CLARIVON looked beyond the literal wording to map goals, problems, root causes, evidence, conflicts, requirements, and next best questions.</p>
        </div>
        <div className="results-actions">
          <Button variant="secondary" onClick={onReset}>
            <Pencil size={15} /> Edit input
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.history.pushState({}, "", "/requirement-analysis?from=discovery");
              window.dispatchEvent(new PopStateEvent("popstate"));
              onToast("Customer discovery findings are ready for requirement analysis.");
            }}
          >
            <Workflow size={15} /> Convert findings
          </Button>
          <Button onClick={() => { setSaved(true); onToast("Discovery saved successfully."); }}>
            {saved ? <Check size={15} /> : <Download size={15} />} {saved ? "Saved" : "Save discovery"}
          </Button>
        </div>
      </div>

      <div className="results-meta">
        <span><span className="live-dot" /> AI analysis complete</span>
        <span>Retail Banking App</span>
        <span>{data?.fileName ? `File: ${data.fileName}` : `${data?.inputType || "Customer Voice"} #09`}</span>
        <span>Analyzed just now</span>
      </div>

      {currentStep === 3 && (
        <section className="surface-card review-panel">
          <div className="card-heading compact">
            <div>
              <span className="card-kicker">DISCOVER · REVIEW FINDINGS</span>
              <h3>Edit and validate what CLARIVON found</h3>
              <p>Correct the core findings, answer the follow-up questions, then confirm or reject this discovery.</p>
            </div>
            <div className="results-actions">
              <Button variant="secondary" disabled={isValidating} onClick={() => submitValidation("rejected")}><X size={15} /> Reject</Button>
              <Button disabled={isValidating} onClick={() => submitValidation("confirmed")}>{isValidating ? "Saving..." : <><Check size={15} /> Confirm findings</>}</Button>
            </div>
          </div>
          <div className="review-fields">
            {[
              ["Customer goal", "goal"],
              ["Stated problem", "statedProblems"],
              ["Root problem", "rootProblems"],
            ].map(([label, key]) => (
              <label key={key}>
                <span>{label}</span>
                <textarea value={review[key as keyof typeof review]} onChange={(event) => setReview((previous) => ({ ...previous, [key]: event.target.value }))} rows={2} />
              </label>
            ))}
          </div>
          <div className="review-questions">
            {(data?.followUpQuestions || data?.questions || []).map((item: any, index: number) => {
              const question = Array.isArray(item) ? item[0] : item.question;
              return <label key={question}><span>Answer {index + 1}: {question}</span><input value={answers[question] || ""} onChange={(event) => setAnswers((previous) => ({ ...previous, [question]: event.target.value }))} placeholder="Add an answer or leave open" /></label>;
            })}
          </div>
        </section>
      )}

      <div className="results-grid">
        <div className="results-main">
          {/* 01: Customer Goal */}
          <section className="result-block accent-blue">
            <div className="result-label">
              <span className="result-num">01</span>
              <div>
                <span className="card-kicker">CUSTOMER GOAL</span>
                <h3>What does the customer want?</h3>
              </div>
              <Badge tone="mint">{validation.confidence}% confidence</Badge>
            </div>
            <p className="result-lead">{data?.goal}</p>
            <div className="result-source">
              <MessageSquareText size={15} />
              <span>Inferred from customer statements in {data?.inputType || "input"}.</span>
            </div>
          </section>

          {/* 02: Stated Problem */}
          <section className="result-block accent-amber">
            <div className="result-label">
              <span className="result-num">02</span>
              <div>
                <span className="card-kicker">STATED PROBLEM</span>
                <h3>What are they saying is wrong?</h3>
              </div>
            </div>
            <p className="result-lead">{data?.stated}</p>
            {data?.evidence?.[0] && (
              <div className="evidence-highlight">
                <span>{data.evidence[0][0]}</span>
                <small>Direct customer statement</small>
              </div>
            )}
          </section>

          {/* 03: Root Problem */}
          <section className="result-block accent-violet root-problem-block">
            <div className="result-label">
              <span className="result-num">03</span>
              <div>
                <span className="card-kicker">ROOT PROBLEM · AI REASONING</span>
                <h3>What may be underneath?</h3>
              </div>
              <ConfidenceRing value={validation.confidence} label="confidence" />
            </div>
            <p className="result-lead">{data?.root}</p>
            <div className="reasoning-box">
              <div className="reasoning-icon"><Lightbulb size={16} /></div>
              <div>
                <strong>Why this is deeper than the stated problem</strong>
                <p>{data?.rootExplanation}</p>
              </div>
            </div>
          </section>

          {/* 04: Symptoms Detected */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">04</span>
              <div>
                <span className="card-kicker">SYMPTOMS DETECTED</span>
                <h3>Signals showing up in the input</h3>
              </div>
              <Badge tone="violet">{data?.symptoms?.length || 0} detected</Badge>
            </div>
            <div className="symptoms-grid">
              {(data?.symptoms || []).map((symptom: string, i: number) => (
                <div className="symptom-chip" key={symptom}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{symptom}</strong>
                  <small>{i < 2 ? "High signal" : "Supporting signal"}</small>
                </div>
              ))}
            </div>
          </section>

          {/* 05: Assumptions Detected */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">05</span>
              <div>
                <span className="card-kicker">ASSUMPTIONS DETECTED</span>
                <h3>What might we be assuming?</h3>
              </div>
              <Badge tone="amber">Unconfirmed</Badge>
            </div>
            {(data?.assumptions || []).map((item: any, idx: number) => (
              <div className="assumption-card" key={idx} style={{ marginBottom: "10px" }}>
                <div className="assumption-icon"><HelpCircle size={18} /></div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </section>

          {/* 06: Evidence */}
          <section className="result-block">
            <div className="result-label">
              <span className="result-num">06</span>
              <div>
                <span className="card-kicker">EVIDENCE</span>
                <h3>What supports these findings?</h3>
              </div>
            </div>
            <div className="evidence-list">
              {(data?.evidence || []).map(([quote, interpretation]: [string, string]) => (
                <div className="evidence-row" key={quote}>
                  <div className="evidence-quote">
                    <span>CUSTOMER STATEMENT</span>
                    <p>{quote}</p>
                  </div>
                  <ArrowRight size={17} />
                  <div className="evidence-interpretation">
                    <span>AI INTERPRETATION</span>
                    <p>{interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 07: Missing Information */}
          <section className="result-block missing-block">
            <div className="result-label">
              <span className="result-num">07</span>
              <div>
                <span className="card-kicker">MISSING INFORMATION</span>
                <h3>What do we still need to know?</h3>
              </div>
              <Badge tone="rose">{data?.missing?.length || 0} context gaps</Badge>
            </div>
            <div className="missing-grid">
              {(data?.missing || []).map(([title, desc, priority]: [string, string, string]) => (
                <div className="missing-card" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <Badge tone={priority === "High" ? "rose" : "amber"}>{priority} priority</Badge>
                  </div>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 08: Conflicts & Contradictions Detected */}
          <section className="result-block conflict-block">
            <div className="result-label">
              <span className="result-num">08</span>
              <div>
                <span className="card-kicker">CONFLICTS & CONTRADICTIONS</span>
                <h3>Trade-offs and opposing requirements</h3>
              </div>
              <Badge tone="rose">{data?.conflicts?.length || 0} identified</Badge>
            </div>
            <div className="conflicts-grid">
              {(data?.conflicts || []).map(([topic, description, impact]: [string, string, string]) => (
                <div className="conflict-card" key={topic}>
                  <div className="conflict-icon"><AlertCircle size={18} /></div>
                  <div className="conflict-body">
                    <strong>{topic}</strong>
                    <p>{description}</p>
                    <Badge tone={impact === "High" ? "rose" : "amber"}>{impact} impact</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 09: Extracted Actionable Requirements */}
          <section className="result-block acceptance-block">
            <div className="result-label">
              <span className="result-num">09</span>
              <div>
                <span className="card-kicker">EXTRACTED REQUIREMENTS</span>
                <h3>Actionable requirements derived from input</h3>
              </div>
              <Badge tone="mint">{data?.requirements?.length || 0} requirements</Badge>
            </div>
            <div className="requirements-grid">
              {(data?.requirements || []).map(([title, desc, priority, category]: [string, string, string, string]) => (
                <div className="requirement-result-card" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                  <div className="requirement-result-tags">
                    <Badge tone={category === "Functional" ? "blue" : "violet"}>{category}</Badge>
                    <Badge tone={priority === "High" ? "rose" : "amber"}>{priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10: AI Follow-Up Questions */}
          <section className="result-block questions-block">
            <div className="result-label">
              <span className="result-num">10</span>
              <div>
                <span className="card-kicker">AI FOLLOW-UP QUESTIONS</span>
                <h3>Ask what matters next</h3>
              </div>
              <div className="question-actions">
                <Button variant="secondary" onClick={copyQuestions}>
                  {questionCopied ? <Check size={14} /> : <Copy size={14} />} {questionCopied ? "Copied" : "Copy questions"}
                </Button>
                <Button variant="ghost" onClick={() => onToast("Question added to your discovery list.")}>
                  <Plus size={14} /> Add question
                </Button>
              </div>
            </div>
            <p className="section-supporting">CLARIVON identified information that is still missing. Ask these questions in your next customer conversation.</p>
            <div className="question-list">
              {(data?.questions || []).map(([question, priority, purpose]: [string, string, string], i: number) => (
                <div className="question-row" key={question}>
                  <span className="question-number">0{i + 1}</span>
                  <div className="question-copy">
                    <strong>{question}</strong>
                    <span>{purpose}</span>
                  </div>
                  <Badge tone={priority === "High" ? "rose" : "amber"}>{priority}</Badge>
                  <button onClick={() => { navigator.clipboard?.writeText(question); onToast("Question copied."); }}>
                    <Copy size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="results-side">
          <div className="surface-card validation-card">
            <div className="card-kicker">PROBLEM VALIDATION</div>
            <h3>Do we understand enough to act?</h3>
            <div className="validation-rings">
              <ConfidenceRing value={validation.confidence} label="Problem confidence" />
              <ConfidenceRing value={validation.evidenceScore} label="Customer evidence" />
              <ConfidenceRing value={validation.clarityScore} label="Problem clarity" />
            </div>
            <div className="validation-stat">
              <div><span>Context completeness</span><strong>{validation.completenessScore}%</strong></div>
              <ProgressBar value={validation.completenessScore} color="blue" />
            </div>
            <div className="validation-stat">
              <div><span>Validation needed</span><strong>{100 - validation.completenessScore}%</strong></div>
              <ProgressBar value={100 - validation.completenessScore} color="amber" />
            </div>
            <div className="validation-summary">
              <ShieldCheck size={16} />
              <p>{validation.summary}</p>
            </div>
          </div>

          <div className="surface-card assistant-card">
            <div className="insight-card-head">
              <div className="ai-orb"><Sparkles size={15} /></div>
              <span>CLARIVON AI</span>
            </div>
            <h3>One thing to carry forward</h3>
            <p>“{data?.followUpQuestions?.[0]?.question || data?.questions?.[0]?.[0] || `Ask about the moment behind: ${data?.rootProblems || data?.root || "the reported problem"}.`}”</p>
            <button className="text-button" onClick={() => onToast("Follow-up prompt saved to your questions.")}>
              Save as prompt <ArrowRight size={14} />
            </button>
          </div>

          <div className="surface-card source-card">
            <div className="card-kicker">SOURCE {data?.inputType?.toUpperCase() || "INPUT"}</div>
            <div className="source-quote">“{rawInput}”</div>
            <button className="text-button" onClick={onReset}>
              Edit source <Pencil size={14} />
            </button>
          </div>
        </aside>
      </div>

      <section className="surface-card discovery-summary">
        <div className="summary-header">
          <div>
            <div className="card-kicker">READY TO SHARE</div>
            <h3>Customer discovery summary</h3>
            <p>{data?.inputType} Analysis · FinBank Customer</p>
          </div>
          <Button variant="secondary" onClick={() => onToast("Share dialog opened.")}>
            <Share2 size={15} /> Share discovery
          </Button>
        </div>
        <div className="summary-grid">
          <div>
            <span>Customer goal</span>
            <strong>{data?.goal}</strong>
          </div>
          <div>
            <span>Root problem</span>
            <strong>{data?.root}</strong>
          </div>
          <div>
            <span>Recommended next step</span>
            <strong>Conduct a follow-up interview focused on the primary friction point.</strong>
          </div>
        </div>
      </section>
    </div>
  );
}



export { NewProjectModal, AIAssistantSidebar, DiscoveryPage, ConfidenceRing, AnalysisResults };
