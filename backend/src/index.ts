import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
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
} from "./controllers/apiController.js";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Metrics
  app.get("/api/metrics", handleGetMetricsRoute);

  // Document extraction & analysis
  app.post("/api/extract-file", handleExtractFileRoute);
  app.post("/api/analyze", handleAnalyzeRoute);
  app.post("/api/ai/requirements", handleRequirementAiRoute);
  app.get("/api/ai/health", handleAiHealthRoute);

  // Projects CRUD
  app.get("/api/projects", handleGetProjectsRoute);
  app.post("/api/projects", handleCreateProjectRoute);
  app.put("/api/projects/:id", handleUpdateProjectRoute);
  app.patch("/api/projects/:id/archive", handleArchiveProjectRoute);
  app.delete("/api/projects/:id", handleDeleteProjectRoute);

  // Analyses
  app.post("/api/analyses", handleCreateAnalysisRoute);
  app.get("/api/analyses/active", handleGetActiveAnalysisRoute);
  app.post("/api/analyses/save", handleSaveAnalysisRoute);
  app.post("/api/analyses/step", handleUpdateStepRoute);
  app.post("/api/analyses/validate", handleValidateAnalysisRoute);

  // AI guidance
  app.post("/api/ai-guidance", handleAiGuidanceRoute);

  // Requirements CRUD
  app.get("/api/requirements", handleGetRequirementsRoute);
  app.post("/api/requirements", handleCreateRequirementRoute);
  app.put("/api/requirements/:id", handleUpdateRequirementRoute);
  app.delete("/api/requirements/:id", handleDeleteRequirementRoute);

  // Questions CRUD
  app.get("/api/questions", handleGetQuestionsRoute);
  app.post("/api/questions", handleCreateQuestionRoute);
  app.put("/api/questions/:id", handleUpdateQuestionRoute);
  app.delete("/api/questions/:id", handleDeleteQuestionRoute);

  // Clarifications CRUD
  app.get("/api/clarifications", handleGetClarificationsRoute);
  app.post("/api/clarifications", handleCreateClarificationRoute);
  app.put("/api/clarifications/:id", handleUpdateClarificationRoute);
  app.delete("/api/clarifications/:id", handleDeleteClarificationRoute);

  // Issues CRUD
  app.get("/api/issues", handleGetIssuesRoute);
  app.post("/api/issues", handleCreateIssueRoute);
  app.put("/api/issues/:id", handleUpdateIssueRoute);
  app.delete("/api/issues/:id", handleDeleteIssueRoute);

  // Reports CRUD + export
  app.get("/api/reports", handleGetReportsRoute);
  app.post("/api/reports", handleCreateReportRoute);
  app.put("/api/reports/:id", handleUpdateReportRoute);
  app.delete("/api/reports/:id", handleDeleteReportRoute);
  app.get("/api/reports/:id/export", handleExportReportRoute);

  // Settings & Profile
  app.get("/api/settings", handleGetSettingsRoute);
  app.put("/api/settings", handleUpdateSettingsRoute);
  app.get("/api/user-profile", handleGetUserProfileRoute);
  app.put("/api/user-profile", handleUpdateUserProfileRoute);

  // Serve static files from dist/public in production
  const staticPath = path.resolve(process.cwd(), "dist", "frontend");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
