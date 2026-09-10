import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Storage proxy not configured");
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });

          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }

          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

function vitePluginApiRoutes(): Plugin {
  return {
    name: "clarivon-api-routes",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        let bodyStr = "";
        req.on("data", (chunk) => { bodyStr += chunk.toString(); });

        req.on("end", async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const db = await import("./server/db");
            const api = await import("./server/api");
            const urlObj = new URL(req.url || "", "http://localhost");
            const pathname = urlObj.pathname;
            const method = req.method?.toUpperCase() || "GET";

            const json200 = (data: any) => {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(data));
            };
            const json400 = (error: string) => {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error }));
            };
            const json404 = (error: string) => {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error }));
            };

            // ── Document extraction ───────────────────────────────────────
            if (pathname === "/api/extract-file" && method === "POST") {
              const { base64Data, fileName, mimeType } = body;
              if (!base64Data || !fileName) return json400("Missing base64Data or fileName");
              const buffer = Buffer.from(base64Data, "base64");
              const result = await api.extractTextFromBuffer(buffer, fileName, mimeType);
              return json200({ success: true, fileName, text: result.text, wordCount: result.wordCount, charCount: result.charCount });
            }

            // ── Analysis ─────────────────────────────────────────────────
            if (pathname === "/api/analyze" && method === "POST") {
              const { inputType, content, fileName } = body;
              if (!content?.trim()) return json400("Input content cannot be empty.");
              const data = api.performAiAnalysis(content, inputType || "Conversation", fileName);
              return json200({ success: true, data });
            }

            // ── Metrics ──────────────────────────────────────────────────
            if (pathname === "/api/metrics" && method === "GET") {
              return json200({ success: true, data: db.getWorkspaceMetrics() });
            }

            // ── Settings & Profile ───────────────────────────────────────
            if (pathname === "/api/settings" && method === "GET") {
              return json200({ success: true, data: db.getSettings() });
            }
            if (pathname === "/api/settings" && method === "PUT") {
              return json200({ success: true, data: db.updateSettings(body) });
            }
            if (pathname === "/api/user-profile" && method === "GET") {
              return json200({ success: true, data: db.getUserProfile() });
            }
            if (pathname === "/api/user-profile" && method === "PUT") {
              return json200({ success: true, data: db.updateUserProfile(body) });
            }

            // ── Clarifications ───────────────────────────────────────────
            if (pathname === "/api/clarifications" && method === "GET") {
              const projectIdStr = urlObj.searchParams.get("projectId");
              const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
              return json200({ success: true, data: db.getClarifications(projectId) });
            }
            if (pathname === "/api/clarifications" && method === "POST") {
              const { projectId, question, priority, category } = body;
              if (!projectId || !question?.trim()) return json400("projectId and question required.");
              return json200({ success: true, data: db.createClarification(Number(projectId), question, priority, category) });
            }
            const clarifMatch = pathname.match(/^\/api\/clarifications\/(\d+)$/);
            if (clarifMatch && method === "PUT") {
              const id = parseInt(clarifMatch[1], 10);
              return json200({ success: true, data: db.updateClarification(id, body) });
            }
            if (clarifMatch && method === "DELETE") {
              const id = parseInt(clarifMatch[1], 10);
              db.deleteClarification(id);
              return json200({ success: true });
            }

            // ── Issues ───────────────────────────────────────────────────
            if (pathname === "/api/issues" && method === "GET") {
              const projectIdStr = urlObj.searchParams.get("projectId");
              const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
              return json200({ success: true, data: db.getIssues(projectId) });
            }
            if (pathname === "/api/issues" && method === "POST") {
              const { projectId, title, severity, category, description } = body;
              if (!projectId || !title?.trim()) return json400("projectId and title required.");
              return json200({ success: true, data: db.createIssue(Number(projectId), title, severity, category, description) });
            }
            const issueMatch = pathname.match(/^\/api\/issues\/(\d+)$/);
            if (issueMatch && method === "PUT") {
              const id = parseInt(issueMatch[1], 10);
              return json200({ success: true, data: db.updateIssue(id, body) });
            }
            if (issueMatch && method === "DELETE") {
              const id = parseInt(issueMatch[1], 10);
              db.deleteIssue(id);
              return json200({ success: true });
            }

            // ── Projects ─────────────────────────────────────────────────
            if (pathname === "/api/projects" && method === "GET") {
              return json200({ success: true, data: db.getAllProjects() });
            }

            if (pathname === "/api/projects" && method === "POST") {
              const { name, customer, tone, description } = body;
              if (!name?.trim()) return json400("Project name is required.");
              const project = db.createProject(name, customer, tone, description);
              return json200({ success: true, data: project });
            }

            // PUT /api/projects/:id
            const projectPutMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
            if (projectPutMatch && method === "PUT") {
              const id = parseInt(projectPutMatch[1], 10);
              const project = db.updateProject(id, body);
              return json200({ success: true, data: project });
            }

            // PATCH /api/projects/:id/archive
            const projectArchiveMatch = pathname.match(/^\/api\/projects\/(\d+)\/archive$/);
            if (projectArchiveMatch && method === "PATCH") {
              const id = parseInt(projectArchiveMatch[1], 10);
              db.archiveProject(id);
              return json200({ success: true });
            }

            // DELETE /api/projects/:id
            const projectDeleteMatch = pathname.match(/^\/api\/projects\/(\d+)$/);
            if (projectDeleteMatch && method === "DELETE") {
              const id = parseInt(projectDeleteMatch[1], 10);
              db.deleteProject(id);
              return json200({ success: true });
            }

            // ── Analyses ─────────────────────────────────────────────────
            if (pathname === "/api/analyses/active" && method === "GET") {
              const projectIdStr = urlObj.searchParams.get("projectId");
              const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
              const row = db.getActiveAnalysis(projectId);
              if (!row) return json200({ success: true, data: null });
              return json200({
                success: true,
                data: {
                  id: row.id, projectId: row.project_id, inputType: row.input_type,
                  rawInput: row.raw_input, fileName: row.file_name,
                  current_step: row.step, status: row.status,
                  analysis_result: row.results_json ? JSON.parse(row.results_json) : null,
                  updatedAt: row.updated_at,
                },
              });
            }

            if (pathname === "/api/analyses/save" && method === "POST") {
              const { projectId, inputType, rawInput, fileName, step, status, result, results } = body;
              if (!projectId) return json400("Missing projectId");
              const finalResult = result || results;
              const row = db.saveAnalysis(Number(projectId), inputType || "Conversation", rawInput || "", fileName, step || 1, status || "idle", finalResult);

              // Auto-populate questions and requirements
              if (finalResult?.questions) {
                for (const [q, priority, purpose] of finalResult.questions) {
                  db.createQuestion(Number(projectId), q, priority || "Medium", purpose || "", row.id);
                }
              }
              if (finalResult?.requirements) {
                for (const [title, desc, priority] of finalResult.requirements) {
                  db.createRequirement(Number(projectId), title, "Customer context", "Missing", priority || "Medium", desc || "");
                }
              }

              return json200({ success: true, data: { id: row.id, projectId: row.project_id, step: row.step, status: row.status } });
            }

            if (pathname === "/api/analyses/step" && method === "POST") {
              const { projectId, step } = body;
              if (!projectId || !step) return json400("Missing projectId or step");
              db.updateAnalysisStep(Number(projectId), Number(step));
              return json200({ success: true, step });
            }

            // ── AI Guidance ───────────────────────────────────────────────
            if (pathname === "/api/ai-guidance" && method === "POST") {
              const { projectId, step, analysisResult } = body;
              const project = projectId ? db.getProjectById(Number(projectId)) : null;
              const projName = project?.name || "your project";
              let guidance = "";
              if (!step || step === 1) {
                guidance = `For ${projName}, the strongest analyses include specific customer moments, workarounds, or exact quotes—not just high-level summaries.`;
              } else if (step === 2) {
                guidance = `CLARIVON AI is parsing customer statements for ${projName} to separate surface complaints from root problems.`;
              } else if (step === 3) {
                const rootMsg = analysisResult?.root || "Reliability friction is impacting customer confidence";
                guidance = `Root insight for ${projName}: ${rootMsg.slice(0, 90)}...`;
              } else if (step === 4) {
                const confidence = analysisResult?.validation?.confidence || 87;
                const gaps = analysisResult?.missing?.length || 4;
                guidance = `Discovery confidence is ${confidence}%. Focus your next conversation on resolving the ${gaps} remaining context gaps.`;
              } else {
                guidance = `Keep discovery focused on behavior and specific friction points across ${projName}.`;
              }
              return json200({ success: true, data: { guidance, projectName: projName, step } });
            }

            // ── Requirements ──────────────────────────────────────────────
            if (pathname === "/api/requirements" && method === "GET") {
              const projectId = parseInt(urlObj.searchParams.get("projectId") || "0", 10);
              if (!projectId) return json400("Missing projectId");
              return json200({ success: true, data: db.getRequirements(projectId) });
            }

            if (pathname === "/api/requirements" && method === "POST") {
              const { projectId, title, category, status, priority, notes } = body;
              if (!projectId || !title?.trim()) return json400("projectId and title are required.");
              const row = db.createRequirement(Number(projectId), title, category || "Customer context", status || "Missing", priority || "Medium", notes || "");
              return json200({ success: true, data: row });
            }

            const reqUpdateMatch = pathname.match(/^\/api\/requirements\/(\d+)$/);
            if (reqUpdateMatch && method === "PUT") {
              const id = parseInt(reqUpdateMatch[1], 10);
              const row = db.updateRequirement(id, body);
              return json200({ success: true, data: row });
            }
            if (reqUpdateMatch && method === "DELETE") {
              const id = parseInt(reqUpdateMatch[1], 10);
              db.deleteRequirement(id);
              return json200({ success: true });
            }

            // ── Questions ─────────────────────────────────────────────────
            if (pathname === "/api/questions" && method === "GET") {
              const projectId = parseInt(urlObj.searchParams.get("projectId") || "0", 10);
              if (!projectId) return json400("Missing projectId");
              return json200({ success: true, data: db.getQuestions(projectId) });
            }

            if (pathname === "/api/questions" && method === "POST") {
              const { projectId, question, priority, purpose } = body;
              if (!projectId || !question?.trim()) return json400("projectId and question are required.");
              const row = db.createQuestion(Number(projectId), question, priority || "Medium", purpose || "");
              return json200({ success: true, data: row });
            }

            const qUpdateMatch = pathname.match(/^\/api\/questions\/(\d+)$/);
            if (qUpdateMatch && method === "PUT") {
              const id = parseInt(qUpdateMatch[1], 10);
              const row = db.updateQuestion(id, body);
              return json200({ success: true, data: row });
            }
            if (qUpdateMatch && method === "DELETE") {
              const id = parseInt(qUpdateMatch[1], 10);
              db.deleteQuestion(id);
              return json200({ success: true });
            }

            // ── Reports ───────────────────────────────────────────────────
            if (pathname === "/api/reports" && method === "GET") {
              const projectId = parseInt(urlObj.searchParams.get("projectId") || "0", 10);
              if (!projectId) return json400("Missing projectId");
              return json200({ success: true, data: db.getReports(projectId) });
            }

            if (pathname === "/api/reports" && method === "POST") {
              const { projectId, title } = body;
              if (!projectId) return json400("Missing projectId");
              const project = db.getProjectById(Number(projectId));
              if (!project) return json404("Project not found.");
              const analysis = db.getActiveAnalysis(Number(projectId));
              const analysisData = analysis?.results_json ? JSON.parse(analysis.results_json) : null;
              const reqs = db.getRequirements(Number(projectId));
              const questions = db.getQuestions(Number(projectId));
              const content = {
                project: { id: project.id, name: project.name, customer: project.customer, description: project.description },
                goal: analysisData?.goal || "No goal captured yet.",
                root: analysisData?.root || "No root problem identified yet.",
                stated: analysisData?.stated || "",
                evidence: analysisData?.evidence || [],
                symptoms: analysisData?.symptoms || [],
                missing: analysisData?.missing || [],
                conflicts: analysisData?.conflicts || [],
                requirements: reqs.map((r: any) => ({ title: r.title, status: r.status, priority: r.priority, category: r.category })),
                questions: questions.map((q: any) => ({ question: q.question, priority: q.priority, status: q.status })),
                validation: analysisData?.validation || { confidence: 80, summary: "Preliminary analysis." },
                generatedAt: new Date().toISOString(),
              };
              const reportTitle = title?.trim() || `${project.name} — Discovery Report`;
              const row = db.createReport(Number(projectId), reportTitle, content);
              return json200({ success: true, data: row });
            }

            const rptMatch = pathname.match(/^\/api\/reports\/(\d+)$/);
            if (rptMatch && method === "PUT") {
              const id = parseInt(rptMatch[1], 10);
              const row = db.updateReport(id, body);
              return json200({ success: true, data: row });
            }
            if (rptMatch && method === "DELETE") {
              const id = parseInt(rptMatch[1], 10);
              db.deleteReport(id);
              return json200({ success: true });
            }

            // GET /api/reports/:id/export
            const exportMatch = pathname.match(/^\/api\/reports\/(\d+)\/export$/);
            if (exportMatch && method === "GET") {
              const id = parseInt(exportMatch[1], 10);
              const report = db.getReportById(id);
              if (!report) return json404("Report not found.");
              const content = JSON.parse(report.content_json);
              const createdAt = new Date(report.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
              const html = buildReportHtml(report.title, content, report.id, createdAt);
              res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `attachment; filename="clarivon-report-${id}.html"`,
              });
              res.end(html);
              return;
            }

            next();
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: err?.message || "Internal server error" }));
          }
        });
      });
    },
  };
}

function buildReportHtml(title: string, content: any, id: number, createdAt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
  body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.65}
  h1{font-size:28px;margin-bottom:6px}
  h2{font-size:18px;margin-top:36px;border-bottom:2px solid #e0e5ff;padding-bottom:6px}
  .meta{color:#777;font-size:13px;margin-bottom:32px}
  .evidence-item{background:#f7f8ff;border-left:4px solid #5267f5;padding:10px 14px;margin:10px 0;border-radius:4px}
  .req-item,.q-item{padding:8px 12px;border:1px solid #e5e8f0;border-radius:6px;margin:6px 0}
  .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:#eef1ff;color:#4a58d4;margin-left:6px}
  .badge.green{background:#e3f7ef;color:#237f5c}
  .badge.amber{background:#fff8e6;color:#b86e00}
  footer{margin-top:48px;border-top:1px solid #e5e8f0;padding-top:16px;color:#999;font-size:12px}
</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">Project: ${content.project?.name||"—"} &nbsp;|&nbsp; Customer: ${content.project?.customer||"—"} &nbsp;|&nbsp; Generated: ${createdAt}</div>
<h2>Customer Goal</h2><p>${content.goal}</p>
<h2>Stated Problem</h2><p>${content.stated}</p>
<h2>Root Problem</h2><p>${content.root}</p>
${(content.evidence?.length>0)?`<h2>Evidence</h2><div>${content.evidence.map(([q,l]:[string,string])=>`<div class="evidence-item"><strong>${q}</strong><p style="margin:4px 0 0;font-size:13px;color:#555">${l}</p></div>`).join("")}</div>`:""}
${(content.requirements?.length>0)?`<h2>Requirements</h2><div>${content.requirements.map((r:any)=>`<div class="req-item"><strong>${r.title}</strong><span class="badge ${r.status==="Known"?"green":r.status==="Missing"?"":"amber"}">${r.status}</span><span class="badge">${r.priority}</span></div>`).join("")}</div>`:""}
${(content.questions?.length>0)?`<h2>Discovery Questions</h2><div>${content.questions.map((q:any,i:number)=>`<div class="q-item"><span style="color:#888;font-size:12px">Q${i+1}</span><strong style="margin-left:6px">${q.question}</strong><span class="badge ${q.status==="Answered"?"green":"amber"}">${q.status}</span></div>`).join("")}</div>`:""}
${content.validation?`<h2>Validation Summary</h2><p>${content.validation.summary}</p><p><strong>Confidence:</strong> ${content.validation.confidence}%</p>`:""}
<footer>Generated by CLARIVON — Customer Discovery Intelligence Platform<br/>Report ID: ${id} &nbsp;|&nbsp; ${createdAt}</footer>
</body>
</html>`;
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginStorageProxy(), vitePluginApiRoutes()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
