/**
 * API Routes - registers all API endpoint handlers from server/api.ts
 * This is a modular re-export layer for the Express router.
 */
import { Router } from "express";
import {
  handleExtractFileRoute,
  handleAnalyzeRoute,
  handleRequirementAiRoute,
  handleAiHealthRoute,
  handleGetMetricsRoute,
  // Projects
  handleGetProjectsRoute,
  handleCreateProjectRoute,
  handleUpdateProjectRoute,
  handleArchiveProjectRoute,
  handleDeleteProjectRoute,
  // Analyses
  handleCreateAnalysisRoute,
  handleGetActiveAnalysisRoute,
  handleSaveAnalysisRoute,
  handleUpdateStepRoute,
  handleValidateAnalysisRoute,
  handleSaveAnalysisReviewRoute,
  // AI
  handleAiGuidanceRoute,
  // Requirements
  handleGetRequirementsRoute,
  handleCreateRequirementRoute,
  handleUpdateRequirementRoute,
  handleDeleteRequirementRoute,
  // Questions
  handleGetQuestionsRoute,
  handleCreateQuestionRoute,
  handleUpdateQuestionRoute,
  handleDeleteQuestionRoute,
  // Clarifications
  handleGetClarificationsRoute,
  handleCreateClarificationRoute,
  handleUpdateClarificationRoute,
  handleDeleteClarificationRoute,
  // Issues
  handleGetIssuesRoute,
  handleCreateIssueRoute,
  handleUpdateIssueRoute,
  handleDeleteIssueRoute,
  // Reports
  handleGetReportsRoute,
  handleCreateReportRoute,
  handleUpdateReportRoute,
  handleDeleteReportRoute,
  handleExportReportRoute,
  // Settings & Profile
  handleGetSettingsRoute,
  handleUpdateSettingsRoute,
  handleGetUserProfileRoute,
  handleUpdateUserProfileRoute,
} from "../controllers/apiController.js";

const router = Router();

// Metrics
router.get("/metrics", handleGetMetricsRoute);

// Document extraction & analysis
router.post("/extract-file", handleExtractFileRoute);
router.post("/analyze", handleAnalyzeRoute);
router.post("/ai/requirements", handleRequirementAiRoute);
router.get("/ai/health", handleAiHealthRoute);

// Projects CRUD
router.get("/projects", handleGetProjectsRoute);
router.post("/projects", handleCreateProjectRoute);
router.put("/projects/:id", handleUpdateProjectRoute);
router.patch("/projects/:id/archive", handleArchiveProjectRoute);
router.delete("/projects/:id", handleDeleteProjectRoute);

// Analyses
router.post("/analyses", handleCreateAnalysisRoute);
router.get("/analyses/active", handleGetActiveAnalysisRoute);
router.post("/analyses/save", handleSaveAnalysisRoute);
router.post("/analyses/step", handleUpdateStepRoute);
router.post("/analyses/validate", handleValidateAnalysisRoute);
router.post("/analyses/review", handleSaveAnalysisReviewRoute);

// AI guidance
router.post("/ai-guidance", handleAiGuidanceRoute);

// Requirements CRUD
router.get("/requirements", handleGetRequirementsRoute);
router.post("/requirements", handleCreateRequirementRoute);
router.put("/requirements/:id", handleUpdateRequirementRoute);
router.delete("/requirements/:id", handleDeleteRequirementRoute);

// Questions CRUD
router.get("/questions", handleGetQuestionsRoute);
router.post("/questions", handleCreateQuestionRoute);
router.put("/questions/:id", handleUpdateQuestionRoute);
router.delete("/questions/:id", handleDeleteQuestionRoute);

// Clarifications CRUD
router.get("/clarifications", handleGetClarificationsRoute);
router.post("/clarifications", handleCreateClarificationRoute);
router.put("/clarifications/:id", handleUpdateClarificationRoute);
router.delete("/clarifications/:id", handleDeleteClarificationRoute);

// Issues CRUD
router.get("/issues", handleGetIssuesRoute);
router.post("/issues", handleCreateIssueRoute);
router.put("/issues/:id", handleUpdateIssueRoute);
router.delete("/issues/:id", handleDeleteIssueRoute);

// Reports CRUD + export
router.get("/reports", handleGetReportsRoute);
router.post("/reports", handleCreateReportRoute);
router.put("/reports/:id", handleUpdateReportRoute);
router.delete("/reports/:id", handleDeleteReportRoute);
router.get("/reports/:id/export", handleExportReportRoute);

// Settings & Profile
router.get("/settings", handleGetSettingsRoute);
router.put("/settings", handleUpdateSettingsRoute);
router.get("/user-profile", handleGetUserProfileRoute);
router.put("/user-profile", handleUpdateUserProfileRoute);

export default router;
