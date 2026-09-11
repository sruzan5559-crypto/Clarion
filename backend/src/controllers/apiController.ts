import { createRequire } from "node:module";
import mammoth from "mammoth";
import type { Request, Response } from "express";
import { analyzeCustomerInput, analyzeRequirementInput, generateGuidance, getAiHealth, type StructuredAnalysis } from "../services/aiProviderService.js";

export { analyzeCustomerInput };

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export interface AnalysisResultData {
  inputType: string;
  fileName?: string;
  goal: string;
  stated: string;
  root: string;
  rootExplanation: string;
  symptoms: string[];
  assumptions: Array<{
    title: string;
    description: string;
    confidence: number;
    status: string;
  }>;
  evidence: Array<[string, string]>;
  missing: Array<[string, string, string]>;
  conflicts: Array<[string, string, string]>;
  requirements: Array<[string, string, string, string]>;
  questions: Array<[string, string, string]>;
  validation: {
    confidence: number;
    evidenceScore: number;
    clarityScore: number;
    completenessScore: number;
    summary: string;
  };
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<{ text: string; wordCount: number; charCount: number }> {
  const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

  let text = "";

  if (ext === "pdf" || mimeType?.includes("pdf")) {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else if (ext === "docx" || mimeType?.includes("wordprocessingml")) {
    const parsed = await mammoth.extractRawText({ buffer });
    text = parsed.value;
  } else if (ext === "txt" || ext === "md" || ext === "csv" || mimeType?.includes("text")) {
    text = buffer.toString("utf-8");
  } else {
    text = buffer.toString("utf-8");
  }

  text = text.replace(/\r\n/g, "\n").trim();
  if (!text) {
    throw new Error("No readable text found in document.");
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  return { text, wordCount: words, charCount: text.length };
}

// ─── Import DB ────────────────────────────────────────────────────────────────
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  deleteProject,
  getActiveAnalysis,
  saveAnalysis,
  updateAnalysisStep,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getClarifications,
  createClarification,
  updateClarification,
  deleteClarification,
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  getSettings,
  updateSettings,
  getUserProfile,
  updateUserProfile,
  getWorkspaceMetrics,
} from "../database/db.js";

// ─── Document extraction ──────────────────────────────────────────────────────

export async function handleExtractFileRoute(req: Request, res: Response) {
  try {
    const { base64Data, fileName, mimeType } = req.body || {};
    if (!base64Data || !fileName) {
      return res.status(400).json({ success: false, error: "Missing base64Data or fileName in request body." });
    }
    const buffer = Buffer.from(base64Data, "base64");
    const result = await extractTextFromBuffer(buffer, fileName, mimeType);
    return res.json({ success: true, fileName, text: result.text, wordCount: result.wordCount, charCount: result.charCount });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "Failed to extract text from document." });
  }
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export async function handleAnalyzeRoute(req: Request, res: Response) {
  try {
    const { inputType, content, fileName } = req.body || {};
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Input content cannot be empty." });
    }
    const providerResult = await analyzeCustomerInput(inputType || "Conversation", content);
    return res.json({ success: true, data: toPresentationAnalysis(providerResult.data, inputType || "Conversation", fileName), provider: providerResult.provider });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "An error occurred during AI analysis." });
  }
}

function toPresentationAnalysis(structured: StructuredAnalysis, inputType: string, fileName?: string) {
  return {
    ...structured,
    inputType,
    fileName,
    stated: structured.statedProblems,
    root: structured.rootProblems,
    rootExplanation: `The root problem is inferred from the customer's stated problem and the evidence in this ${inputType.toLowerCase()}.`,
    evidence: structured.evidence.map((item) => [item.quote, item.interpretation]),
    missing: structured.missingContext.map((item) => [item.title, item.description, item.priority]),
    conflicts: structured.conflicts.map((item) => [item.topic, item.description, item.impact]),
    requirements: structured.requirements.map((item) => [item.title, item.description, item.priority, item.category]),
    questions: structured.followUpQuestions.map((item) => [item.question, item.priority, item.purpose]),
    validation: {
      confidence: structured.confidence,
      evidenceScore: Math.min(100, structured.confidence + 5),
      clarityScore: structured.confidence,
      completenessScore: structured.confidence,
      summary: `Structured analysis grounded in ${structured.evidence.length} evidence item(s).`,
    },
  };
}

export async function handleRequirementAiRoute(req: Request, res: Response) {
  try {
    const content = req.body?.content;
    const projectId = Number(req.body?.projectId);
    if (!content || typeof content !== "string" || !content.trim()) return res.status(400).json({ success: false, error: "Requirement input cannot be empty." });
    const result = await analyzeRequirementInput(content.trim());
    const saved = projectId && getProjectById(projectId)
      ? saveAnalysis(projectId, req.body?.sourceType || "Requirement Analysis", content.trim(), undefined, 3, "discovered", result.data)
      : null;
    return res.json({ success: true, data: result.data, provider: result.provider, analysisId: saved?.id || null, currentStep: saved?.step || 3 });
  } catch (err: any) {
    return res.status(502).json({ success: false, error: err?.message || "Requirement analysis failed." });
  }
}

export function handleAiHealthRoute(_req: Request, res: Response) {
  return res.json({ success: true, data: getAiHealth() });
}

export async function createAnalysis(input: {
  projectId?: number;
  inputType?: string;
  content?: string;
  rawInput?: string;
  fileName?: string;
}) {
  const projectId = Number(input.projectId);
  const inputType = input.inputType?.trim() || "Conversation";
  const content = (input.content || input.rawInput || "").trim();
  if (!projectId || !getProjectById(projectId)) throw new Error("Select a project before analyzing.");
  if (!content) throw new Error("Customer input cannot be empty.");

  saveAnalysis(projectId, inputType, content, input.fileName, 2, "analyzing", null);
  try {
    const providerResult = await analyzeCustomerInput(inputType, content);
    const structured = providerResult.data;
    const result = toPresentationAnalysis(structured, inputType, input.fileName);
    const row = saveAnalysis(projectId, inputType, content, input.fileName, 3, "discovered", result);
    for (const item of structured.followUpQuestions) createQuestion(projectId, item.question, item.priority, item.purpose, row.id);
    for (const item of structured.requirements) createRequirement(projectId, item.title, item.category, "Missing", item.priority, item.description);
    const existingClarifications = getClarifications(projectId);
    for (const item of structured.missingContext) {
      if (!existingClarifications.some((clarification) => clarification.question === item.description)) {
        createClarification(projectId, item.description, item.priority, "AI Missing Context");
      }
    }
    return { id: row.id, projectId, currentStep: 3, status: "discovered", provider: providerResult.provider, analysisResult: result };
  } catch (error) {
    saveAnalysis(projectId, inputType, content, input.fileName, 2, "failed", null);
    throw error;
  }
}

export async function handleCreateAnalysisRoute(req: Request, res: Response) {
  try {
    const data = await createAnalysis(req.body || {});
    return res.json({ success: true, data });
  } catch (err: any) {
    const message = err?.message || "Analysis failed.";
    return res.status(message.includes("Select a project") || message.includes("cannot be empty") ? 400 : 502)
      .json({ success: false, error: message });
  }
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export async function handleGetMetricsRoute(_req: Request, res: Response) {
  try {
    return res.json({ success: true, data: getWorkspaceMetrics() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function handleGetProjectsRoute(_req: Request, res: Response) {
  try {
    return res.json({ success: true, data: getAllProjects() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to fetch projects." });
  }
}

export async function handleCreateProjectRoute(req: Request, res: Response) {
  try {
    const { name, customer, tone, description } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, error: "Project name is required." });
    }
    const project = createProject(name, customer, tone, description);
    return res.json({ success: true, data: project });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "Failed to create project." });
  }
}

export async function handleUpdateProjectRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, error: "Invalid project ID." });
    const project = updateProject(id, req.body || {});
    return res.json({ success: true, data: project });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "Failed to update project." });
  }
}

export async function handleArchiveProjectRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, error: "Invalid project ID." });
    archiveProject(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to archive project." });
  }
}

export async function handleDeleteProjectRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, error: "Invalid project ID." });
    deleteProject(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to delete project." });
  }
}

// ─── Analyses ─────────────────────────────────────────────────────────────────

export async function handleGetActiveAnalysisRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    const analysisRow = getActiveAnalysis(projectId);

    if (!analysisRow) return res.json({ success: true, data: null });

    return res.json({
      success: true,
      data: {
        id: analysisRow.id,
        projectId: analysisRow.project_id,
        inputType: analysisRow.input_type,
        rawInput: analysisRow.raw_input,
        fileName: analysisRow.file_name,
        current_step: analysisRow.step,
        status: analysisRow.status,
        analysis_result: analysisRow.results_json ? JSON.parse(analysisRow.results_json) : null,
        updatedAt: analysisRow.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to fetch active analysis." });
  }
}

export async function handleSaveAnalysisRoute(req: Request, res: Response) {
  try {
    const { projectId, inputType, rawInput, fileName, step, status, result, results } = req.body || {};
    if (!projectId) return res.status(400).json({ success: false, error: "Missing projectId" });

    const finalResult = result || results;
    const row = saveAnalysis(Number(projectId), inputType || "Conversation", rawInput || "", fileName, step || 1, status || "idle", finalResult);

    if (finalResult?.questions) {
      for (const [q, priority, purpose] of finalResult.questions) {
        createQuestion(Number(projectId), q, priority || "Medium", purpose || "", row.id);
      }
    }

    if (finalResult?.requirements) {
      for (const [title, desc, priority] of finalResult.requirements) {
        createRequirement(Number(projectId), title, "Customer context", "Missing", priority || "Medium", desc || "");
      }
    }

    return res.json({ success: true, data: { id: row.id, projectId: row.project_id, step: row.step, status: row.status } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to save analysis." });
  }
}

export async function handleUpdateStepRoute(req: Request, res: Response) {
  try {
    const { projectId, step, status } = req.body || {};
    if (!projectId || !step) return res.status(400).json({ success: false, error: "Missing projectId or step" });
    const analysis = getActiveAnalysis(Number(projectId));
    if (!analysis) return res.status(409).json({ success: false, error: "Analyze customer input before changing workflow steps." });
    if (Number(step) < 1 || Number(step) > 4 || Number(step) > analysis.step + 1) {
      return res.status(409).json({ success: false, error: "Complete the current discovery step before moving forward." });
    }
    updateAnalysisStep(Number(projectId), Number(step), status);
    return res.json({ success: true, step, status: status || analysis.status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to update step." });
  }
}

export async function handleValidateAnalysisRoute(req: Request, res: Response) {
  try {
    const { projectId, decision, answers, findings } = req.body || {};
    const project = Number(projectId);
    const active = getActiveAnalysis(project);
    if (!project || !active?.results_json) return res.status(409).json({ success: false, error: "Complete analysis before validating findings." });
    if (decision !== "confirmed" && decision !== "rejected") return res.status(400).json({ success: false, error: "Validation decision must be confirmed or rejected." });
    const result = { ...JSON.parse(active.results_json), validationReview: { decision, answers: answers || {}, findings: findings || {}, reviewedAt: new Date().toISOString() } };
    const row = saveAnalysis(project, active.input_type, active.raw_input, active.file_name, decision === "confirmed" ? 4 : 3, decision === "confirmed" ? "validated" : "needs_review", result);
    return res.json({ success: true, data: { id: row.id, currentStep: row.step, status: row.status, analysisResult: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to save validation." });
  }
}

export async function handleSaveAnalysisReviewRoute(req: Request, res: Response) {
  try {
    const { projectId, answers, findings } = req.body || {};
    const project = Number(projectId);
    const active = getActiveAnalysis(project);
    if (!project || !active?.results_json) return res.status(409).json({ success: false, error: "Complete analysis before saving findings." });
    const existing = JSON.parse(active.results_json);
    const nextFindings = findings || {};
    const result = {
      ...existing,
      ...nextFindings,
      stated: nextFindings.statedProblems || existing.stated,
      root: nextFindings.rootProblems || existing.root,
      validationReview: {
        ...(existing.validationReview || {}),
        answers: answers || existing.validationReview?.answers || {},
        findings: nextFindings,
        reviewedAt: new Date().toISOString(),
      },
    };
    const row = saveAnalysis(project, active.input_type, active.raw_input, active.file_name, 3, "discovered", result);
    return res.json({ success: true, data: { id: row.id, currentStep: row.step, status: row.status, analysisResult: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to save review." });
  }
}

// ─── AI Guidance ──────────────────────────────────────────────────────────────

export async function handleAiGuidanceRoute(req: Request, res: Response) {
  try {
    const { projectId, step, analysisResult } = req.body || {};
    const project = projectId ? getProjectById(Number(projectId)) : null;
    const projName = project?.name || "your project";

    const result = await generateGuidance({ projectName: projName, step: Number(step) || 1, analysisResult });
    return res.json({ success: true, data: { guidance: result.data, projectName: projName, step, provider: result.provider } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "AI guidance temporarily unavailable." });
  }
}

// ─── Requirements ─────────────────────────────────────────────────────────────

export async function handleGetRequirementsRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    return res.json({ success: true, data: getRequirements(projectId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleCreateRequirementRoute(req: Request, res: Response) {
  try {
    const { projectId, title, category, status, priority, notes } = req.body || {};
    if (!projectId || !title?.trim()) return res.status(400).json({ success: false, error: "projectId and title are required." });
    const row = createRequirement(Number(projectId), title, category || "Customer context", status || "Missing", priority || "Medium", notes || "");
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateRequirementRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = updateRequirement(id, req.body || {});
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleDeleteRequirementRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    deleteRequirement(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function handleGetQuestionsRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    return res.json({ success: true, data: getQuestions(projectId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleCreateQuestionRoute(req: Request, res: Response) {
  try {
    const { projectId, question, priority, purpose } = req.body || {};
    if (!projectId || !question?.trim()) return res.status(400).json({ success: false, error: "projectId and question are required." });
    const row = createQuestion(Number(projectId), question, priority || "Medium", purpose || "");
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateQuestionRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = updateQuestion(id, req.body || {});
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleDeleteQuestionRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    deleteQuestion(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Clarifications ──────────────────────────────────────────────────────────

export async function handleGetClarificationsRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    return res.json({ success: true, data: getClarifications(projectId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleCreateClarificationRoute(req: Request, res: Response) {
  try {
    const { projectId, question, priority, category } = req.body || {};
    if (!projectId || !question?.trim()) return res.status(400).json({ success: false, error: "projectId and question are required." });
    const row = createClarification(Number(projectId), question, priority || "Medium", category || "Business Logic");
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateClarificationRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = updateClarification(id, req.body || {});
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleDeleteClarificationRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    deleteClarification(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export async function handleGetIssuesRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    return res.json({ success: true, data: getIssues(projectId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleCreateIssueRoute(req: Request, res: Response) {
  try {
    const { projectId, title, severity, category, description } = req.body || {};
    if (!projectId || !title?.trim()) return res.status(400).json({ success: false, error: "projectId and title are required." });
    const row = createIssue(Number(projectId), title, severity || "Medium", category || "Ambiguity", description || "");
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateIssueRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = updateIssue(id, req.body || {});
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleDeleteIssueRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    deleteIssue(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function handleGetReportsRoute(req: Request, res: Response) {
  try {
    const projectIdStr = req.query.projectId as string | undefined;
    const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
    return res.json({ success: true, data: getReports(projectId) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleCreateReportRoute(req: Request, res: Response) {
  try {
    const { projectId, title } = req.body || {};
    if (!projectId) return res.status(400).json({ success: false, error: "Missing projectId" });

    const project = getProjectById(Number(projectId));
    if (!project) return res.status(404).json({ success: false, error: "Project not found." });

    const analysis = getActiveAnalysis(Number(projectId));
    if (!analysis?.results_json) return res.status(409).json({ success: false, error: "Run a real AI analysis before creating a report." });
    const analysisData = JSON.parse(analysis.results_json);

    const reqs = getRequirements(Number(projectId));
    const questions = getQuestions(Number(projectId));

    const content = {
      project: { id: project.id, name: project.name, customer: project.customer, description: project.description },
      goal: analysisData.goal,
      root: analysisData.root,
      stated: analysisData.stated,
      evidence: analysisData?.evidence || [],
      symptoms: analysisData?.symptoms || [],
      missing: analysisData?.missing || [],
      conflicts: analysisData?.conflicts || [],
      requirements: reqs.map((r) => ({ title: r.title, status: r.status, priority: r.priority, category: r.category })),
      questions: questions.map((q) => ({ question: q.question, priority: q.priority, status: q.status })),
      validation: analysisData.validation,
      generatedAt: new Date().toISOString(),
    };

    const reportTitle = title?.trim() || `${project.name} — Discovery Report`;
    const row = createReport(Number(projectId), reportTitle, content);
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateReportRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = updateReport(id, req.body || {});
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleDeleteReportRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    deleteReport(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleExportReportRoute(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const report = getReportById(id);
    if (!report) return res.status(404).json({ success: false, error: "Report not found." });

    const content = JSON.parse(report.content_json);
    const createdAt = new Date(report.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${report.title}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; line-height: 1.65; }
  h1 { font-size: 26px; margin-bottom: 6px; color: #111827; }
  h2 { font-size: 18px; margin-top: 32px; border-bottom: 2px solid #e0e5ff; padding-bottom: 6px; color: #374151; }
  .meta { color: #6b7280; font-size: 13px; margin-bottom: 28px; }
  .evidence-item { background: #f7f8ff; border-left: 4px solid #5267f5; padding: 10px 14px; margin: 10px 0; border-radius: 4px; }
  .req-item, .q-item { padding: 8px 12px; border: 1px solid #e5e8f0; border-radius: 6px; margin: 6px 0; display: flex; align-items: center; justify-content: space-between; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #eef1ff; color: #4a58d4; }
  .badge.green { background: #e3f7ef; color: #237f5c; }
  .badge.amber { background: #fff8e6; color: #b86e00; }
  footer { margin-top: 48px; border-top: 1px solid #e5e8f0; padding-top: 16px; color: #9ca3af; font-size: 12px; }
</style>
</head>
<body>
<h1>${report.title}</h1>
<div class="meta">
  Project: ${content.project?.name || "—"} &nbsp;|&nbsp;
  Customer: ${content.project?.customer || "—"} &nbsp;|&nbsp;
  Generated: ${createdAt}
</div>

<h2>Customer Goal</h2>
<p>${content.goal}</p>

<h2>Stated Problem</h2>
<p>${content.stated}</p>

<h2>Root Problem</h2>
<p>${content.root}</p>

${content.evidence?.length > 0 ? `
<h2>Evidence</h2>
<div>
  ${content.evidence.map(([quote, label]: [string, string]) => `
    <div class="evidence-item">
      <strong>${quote}</strong>
      <p style="margin:4px 0 0;font-size:13px;color:#555;">${label}</p>
    </div>
  `).join("")}
</div>
` : ""}

${content.requirements?.length > 0 ? `
<h2>Requirements</h2>
<div>
  ${content.requirements.map((r: any) => `
    <div class="req-item">
      <strong>${r.title}</strong>
      <div>
        <span class="badge ${r.status === 'Known' ? 'green' : r.status === 'Missing' ? '' : 'amber'}">${r.status}</span>
        <span class="badge">${r.priority}</span>
      </div>
    </div>
  `).join("")}
</div>
` : ""}

${content.questions?.length > 0 ? `
<h2>Discovery Questions</h2>
<div>
  ${content.questions.map((q: any, i: number) => `
    <div class="q-item">
      <div><span style="color:#888;font-size:12px;">Q${i + 1}</span> <strong style="margin-left:6px;">${q.question}</strong></div>
      <span class="badge ${q.status === 'Answered' ? 'green' : 'amber'}">${q.status}</span>
    </div>
  `).join("")}
</div>
` : ""}

${content.validation ? `
<h2>Validation Summary</h2>
<p>${content.validation.summary}</p>
<p><strong>Confidence:</strong> ${content.validation.confidence}%</p>
` : ""}

<footer>
  Generated by CLARIVON — Customer Discovery & Requirement Intelligence Platform<br/>
  Report ID: ${report.id} &nbsp;|&nbsp; ${createdAt}
</footer>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="clarivon-report-${id}.html"`);
    res.send(html);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

// ─── Settings & Profile ─────────────────────────────────────────────────────

function publicSettings() {
  const settings = getSettings();
  return { ...settings, api_key: "", api_key_configured: Boolean(settings.api_key) };
}

export async function handleGetSettingsRoute(_req: Request, res: Response) {
  try {
    return res.json({ success: true, data: publicSettings() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateSettingsRoute(req: Request, res: Response) {
  try {
    const settings = updateSettings(req.body || {});
    return res.json({ success: true, data: { ...settings, api_key: "", api_key_configured: Boolean(settings.api_key) } });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}

export async function handleGetUserProfileRoute(_req: Request, res: Response) {
  try {
    return res.json({ success: true, data: getUserProfile() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
}

export async function handleUpdateUserProfileRoute(req: Request, res: Response) {
  try {
    const profile = updateUserProfile(req.body || {});
    return res.json({ success: true, data: profile });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message });
  }
}
