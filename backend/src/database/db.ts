import Database from "better-sqlite3";
import path from "node:path";

const dbPath = process.env.CLARIVON_DB_PATH || path.resolve(process.cwd(), "backend", "data", "clarivon.db");
const db = new Database(dbPath);

// Enable WAL mode for performance & concurrent reads
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    customer TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    tone TEXT DEFAULT 'blue',
    status TEXT DEFAULT 'In Progress',
    archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    input_type TEXT NOT NULL,
    raw_input TEXT NOT NULL,
    file_name TEXT,
    step INTEGER DEFAULT 1,
    status TEXT DEFAULT 'idle',
    results_json TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Customer context',
    status TEXT DEFAULT 'Missing',
    priority TEXT DEFAULT 'Medium',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    analysis_id INTEGER,
    question TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    purpose TEXT DEFAULT '',
    status TEXT DEFAULT 'Unanswered',
    answer TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    content_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clarifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    category TEXT DEFAULT 'Business Logic',
    status TEXT DEFAULT 'Open',
    answer TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    severity TEXT DEFAULT 'Medium',
    category TEXT DEFAULT 'Ambiguity',
    status TEXT DEFAULT 'Open',
    description TEXT DEFAULT '',
    resolution_notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    workspace_name TEXT DEFAULT 'CLARIVON Discovery Workspace',
    ai_provider TEXT DEFAULT 'openai',
    api_key TEXT DEFAULT '',
    auto_analyze INTEGER DEFAULT 1,
    email_notifications INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT DEFAULT 'John Doe',
    email TEXT DEFAULT 'john.doe@clarivon.com',
    role TEXT DEFAULT 'Lead Product Manager',
    avatar TEXT DEFAULT 'JD',
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Migration helpers for optional columns
try { db.exec(`ALTER TABLE projects ADD COLUMN description TEXT DEFAULT ''`); } catch {}
try { db.exec(`ALTER TABLE projects ADD COLUMN archived INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE projects ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`); } catch {}
try { db.exec(`ALTER TABLE projects ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`); } catch {}

// Initialize singletons if missing
db.exec(`
  INSERT OR IGNORE INTO settings (id, workspace_name, ai_provider, auto_analyze, email_notifications)
  VALUES (1, 'CLARIVON Discovery Workspace', 'openai', 1, 1);

  INSERT OR IGNORE INTO user_profile (id, name, email, role, avatar)
  VALUES (1, 'John Doe', 'john.doe@clarivon.com', 'Lead Product Manager', 'JD');
`);

// ─── Seed Data Script ────────────────────────────────────────────────────────

export function seedDatabaseIfEmpty() {
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM projects");
  const { count } = countStmt.get() as { count: number };

  // If projects exist with requirements, questions, and analyses, skip seeding
  const reqCountStmt = db.prepare("SELECT COUNT(*) as count FROM requirements");
  const { count: reqCount } = reqCountStmt.get() as { count: number };

  if (count > 0 && reqCount > 5) {
    return; // Already populated
  }

  // Clear existing default rows if under-seeded
  db.exec("DELETE FROM projects; DELETE FROM analyses; DELETE FROM requirements; DELETE FROM questions; DELETE FROM reports; DELETE FROM clarifications; DELETE FROM issues;");

  // Project 1: Retail Banking Mobile App / FinBank
  const p1Info = db.prepare(`
    INSERT INTO projects (name, customer, description, tone, status, created_at, updated_at)
    VALUES ('Retail Banking Mobile App', 'FinBank', 'Mobile banking transfer, card activation, and account management user flows.', 'blue', 'In Progress', datetime('now', '-30 days'), datetime('now', '-2 hours'))
  `).run();
  const p1Id = Number(p1Info.lastInsertRowid);

  // Project 2: E-Commerce Checkout / Northstar Market
  const p2Info = db.prepare(`
    INSERT INTO projects (name, customer, description, tone, status, created_at, updated_at)
    VALUES ('E-Commerce Checkout', 'Northstar Market', 'Streamline guest checkout, address lookup, and payment gateway retries.', 'violet', 'In Progress', datetime('now', '-20 days'), datetime('now', '-1 day'))
  `).run();
  const p2Id = Number(p2Info.lastInsertRowid);

  // Project 3: Healthcare Appointment System / Wellnest
  const p3Info = db.prepare(`
    INSERT INTO projects (name, customer, description, tone, status, created_at, updated_at)
    VALUES ('Healthcare Appointment System', 'Wellnest', 'Patient self-scheduling, doctor availability, and SMS reminder workflows.', 'mint', 'Validated', datetime('now', '-10 days'), datetime('now', '-3 days'))
  `).run();
  const p3Id = Number(p3Info.lastInsertRowid);

  // ── Seed Analyses for Project 1 (FinBank) ──
  const p1AnalysisJson = {
    inputType: "Conversation",
    goal: "The customer wants to send money to family members internationally without recurring transfer failures or delayed status updates.",
    stated: "The transfer failed twice and I didn’t know if my money was taken from my account or not.",
    root: "Systemic lack of real-time transaction status confirmation and idempotency checks during external payment gateway retries.",
    rootExplanation: "While stated as a transfer failure, the core friction stems from zero feedback while gateway calls time out, forcing customers to retry blindly.",
    symptoms: [
      "Customer mentions 'fail' and 'confusion' during bank transfers",
      "Customer support calls escalated after silent transfer delay",
      "Manual account balance refresh required to confirm state"
    ],
    assumptions: [
      { title: "Users receive SMS alerts immediately upon payment clearance.", description: "Assumes cellular network speed and provider SMS API availability.", confidence: 78, status: "Not confirmed" },
      { title: "Customers understand pending vs posted transaction states.", description: "Assumes financial literacy regarding bank processing windows.", confidence: 62, status: "Unvalidated" }
    ],
    evidence: [
      ["“Every time I hit transfer, the screen freezes for 10 seconds and then shows an error without saying if it went through.”", "Direct indicator of critical payment flow blockage."],
      ["“I had to call customer support 3 times just to confirm if my rent payment posted.”", "Demonstrates heavy reliance on support channels due to UI ambiguity."]
    ],
    missing: [
      ["Retry Limit", "What is the acceptable retry attempt count before failing permanently?", "High"],
      ["Gateway Timeout Threshold", "How long should the mobile app wait for external payment network ACK?", "High"],
      ["Customer Segment", "Are international transfer users more impacted than domestic transfer users?", "Medium"]
    ],
    conflicts: [
      ["Speed vs Security Verification", "Customers want instant 1-tap transfer execution, but fraud detection checks require OTP verification.", "High"]
    ],
    requirements: [
      ["Real-Time Transfer Status Indicator", "Provide immediate visual state updates during transfer processing.", "High", "Functional"],
      ["Idempotency Protection", "Prevent duplicate charges when users tap retry during network timeouts.", "High", "Resilience"],
      ["Automated Failure Reason Prompts", "Display user-friendly explanations for rejected transactions with next steps.", "Medium", "UX"]
    ],
    questions: [
      ["What exact error message displayed when the transfer timed out?", "High", "Isolate payment gateway error mapping."],
      ["How frequently do you perform recurring international transfers?", "Medium", "Quantify user volume and frequency."]
    ],
    validation: {
      confidence: 87,
      evidenceScore: 92,
      clarityScore: 84,
      completenessScore: 85,
      summary: "High confidence analysis based on direct customer interview transcript. Clear evidence of payment state ambiguity."
    }
  };

  db.prepare(`
    INSERT INTO analyses (project_id, input_type, raw_input, file_name, step, status, results_json, updated_at)
    VALUES (?, 'Conversation', 'Interviewer: What issue did you run into during transfer?\nUser: Every time I hit transfer, the screen freezes for 10 seconds and then shows an error without saying if it went through.', 'FinBank_Interview_08.txt', 4, 'saved', ?, datetime('now', '-2 hours'))
  `).run(p1Id, JSON.stringify(p1AnalysisJson));

  // ── Seed Requirements for Project 1 ──
  const reqInsert = db.prepare(`
    INSERT INTO requirements (project_id, title, category, status, priority, notes) VALUES (?, ?, ?, ?, ?, ?)
  `);
  reqInsert.run(p1Id, 'Real-Time Transfer Status Indicator', 'Customer context', 'Known', 'High', 'Must show loading spinner, pending state, and success checkmark.');
  reqInsert.run(p1Id, 'Idempotency Protection on Gateway Retries', 'Technical constraint', 'Known', 'High', 'Attach unique transaction GUID to avoid duplicate debiting.');
  reqInsert.run(p1Id, 'Automated Failure Reason Display', 'Customer context', 'Partially Known', 'Medium', 'Map HTTP 402/503 errors to human readable prompts.');
  reqInsert.run(p1Id, 'Push Notification on Transfer Clearance', 'Workflow & process', 'Missing', 'Medium', 'Notify user within 5 seconds of clearance.');
  reqInsert.run(p1Id, 'Biometric Re-authentication for Large Sums', 'Security & Compliance', 'Known', 'High', 'Require FaceID/Fingerprint for transfers over $1,000.');

  // ── Seed Requirements for Project 2 (Northstar Market) ──
  reqInsert.run(p2Id, '1-Click Guest Checkout', 'Customer context', 'Known', 'High', 'Allow purchasing without forcing account password creation.');
  reqInsert.run(p2Id, 'Address Auto-Complete via Google Maps API', 'Integrations', 'Partially Known', 'High', 'Reduce address entry typos during mobile checkout.');
  reqInsert.run(p2Id, 'Saved Payment Method Quick Select', 'User Experience', 'Missing', 'Medium', 'Support Apple Pay, Google Pay, and saved cards.');

  // ── Seed Requirements for Project 3 (Wellnest) ──
  reqInsert.run(p3Id, 'Patient Self-Scheduling Calendar', 'Workflow & process', 'Known', 'High', 'Display real-time doctor availability slots.');
  reqInsert.run(p3Id, 'Automated SMS Appointment Reminders', 'Communication', 'Known', 'High', 'Send SMS 24 hours and 2 hours prior to scheduled appointment.');
  reqInsert.run(p3Id, 'Insurance Card Photo Upload & OCR', 'Integrations', 'Known', 'Medium', 'Extract member ID and group number automatically.');

  // ── Seed Questions for Project 1 ──
  const qInsert = db.prepare(`
    INSERT INTO questions (project_id, question, priority, purpose, status, answer) VALUES (?, ?, ?, ?, ?, ?)
  `);
  qInsert.run(p1Id, 'What exact error message displayed when the transfer timed out?', 'High', 'Isolate payment gateway error mapping.', 'Answered', 'Users reported seeing "Error 500: Gateway Timeout" with no follow-up instructions.');
  qInsert.run(p1Id, 'What action did you take immediately after experiencing this issue?', 'High', 'Map out user fallback behavior.', 'Answered', 'Users refreshed the app balance page and called customer support.');
  qInsert.run(p1Id, 'How should the mobile app handle partial network dropouts during transfer submit?', 'High', 'Define offline queueing behavior.', 'Unanswered', '');
  qInsert.run(p1Id, 'What is the maximum acceptable retry threshold before auto-canceling?', 'Medium', 'Establish backend retry policy.', 'Unanswered', '');

  // ── Seed Questions for Project 2 ──
  qInsert.run(p2Id, 'What percentage of mobile users drop off at the credit card entry step?', 'High', 'Quantify checkout friction.', 'Unanswered', '');
  qInsert.run(p2Id, 'Does guest checkout require email verification prior to order placement?', 'High', 'Define order confirmation constraint.', 'Answered', 'No, verification email is sent post-purchase.');

  // ── Seed Questions for Project 3 ──
  qInsert.run(p3Id, 'Are patients allowed to reschedule appointments less than 2 hours before the slot?', 'Medium', 'Establish cancellation policy rules.', 'Answered', 'Rescheduling within 2 hours requires calling the clinic front desk.');

  // ── Seed Clarifications for Project 1 & 2 ──
  const clarInsert = db.prepare(`
    INSERT INTO clarifications (project_id, question, priority, category, status, answer) VALUES (?, ?, ?, ?, ?, ?)
  `);
  clarInsert.run(p1Id, 'Should international wire transfers use instantaneous FX lock rates or execution-time rates?', 'High', 'Business Logic', 'Open', '');
  clarInsert.run(p1Id, 'What is the retry protocol when core banking ledger API returns HTTP 504?', 'High', 'Technical Specs', 'Open', '');
  clarInsert.run(p1Id, 'Do daily transfer limits reset at midnight UTC or local customer timezone?', 'Medium', 'Compliance', 'Resolved', 'Daily transfer limits reset at midnight in customer’s home timezone.');
  clarInsert.run(p2Id, 'Is address validation mandatory for digital gift card purchases?', 'Medium', 'Edge Cases', 'Open', '');

  // ── Seed Issues for Project 1 & 2 ──
  const issueInsert = db.prepare(`
    INSERT INTO issues (project_id, title, severity, category, status, description, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  issueInsert.run(p1Id, 'Ambiguous ledger response state during gateway timeout', 'High', 'Ambiguity', 'Open', 'When the payment gateway times out, the backend ledger status remains "PENDING_GATEWAY" indefinitely, leaving the user in limbo.', '');
  issueInsert.run(p1Id, 'Conflict between instant execution and mandatory 2FA prompt', 'Medium', 'Conflict', 'Open', 'Security team mandates 2FA for all transfers, while Product team wants 1-click execution for saved payees.', '');
  issueInsert.run(p1Id, 'Missing clear failure reason for insufficient funds vs daily limit reached', 'Medium', 'Missing Context', 'Resolved', 'Both error states previously triggered generic "Transfer Failed".', 'Mapped error code 4001 to Daily Limit Exceeded and 4002 to Insufficient Funds.');
  issueInsert.run(p2Id, 'Guest checkout fraud risk on high-value orders', 'High', 'Risk', 'Open', 'Unauthenticated purchases above $500 show 3x higher chargeback rates.', '');

  // ── Seed Reports for Project 1 & 3 ──
  const rInsert = db.prepare(`
    INSERT INTO reports (project_id, title, status, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '-1 day'))
  `);
  rInsert.run(p1Id, 'Retail Banking App — Executive Discovery Summary', 'Final', JSON.stringify({
    project: { name: 'Retail Banking Mobile App', customer: 'FinBank', description: 'Mobile banking transfer flows' },
    goal: p1AnalysisJson.goal,
    stated: p1AnalysisJson.stated,
    root: p1AnalysisJson.root,
    evidence: p1AnalysisJson.evidence,
    requirements: [
      { title: 'Real-Time Transfer Status Indicator', status: 'Known', priority: 'High' },
      { title: 'Idempotency Protection on Gateway Retries', status: 'Known', priority: 'High' },
      { title: 'Automated Failure Reason Display', status: 'Partially Known', priority: 'Medium' }
    ],
    questions: [
      { question: 'What exact error message displayed when the transfer timed out?', status: 'Answered', priority: 'High' }
    ],
    validation: p1AnalysisJson.validation
  }));

  rInsert.run(p3Id, 'Healthcare Appointment System — Validation Report', 'Final', JSON.stringify({
    project: { name: 'Healthcare Appointment System', customer: 'Wellnest', description: 'Patient self-scheduling portal' },
    goal: 'Patients want to schedule and manage doctor appointments online without waiting on hold.',
    stated: 'Phone scheduling lines are busy during peak morning hours.',
    root: 'Manual call-center scheduling bottlenecks patient access and increases appointment no-shows.',
    evidence: [["“I waited 25 minutes on hold just to book a routine checkup.”", "Direct patient pain point."]],
    requirements: [
      { title: 'Patient Self-Scheduling Calendar', status: 'Known', priority: 'High' },
      { title: 'Automated SMS Appointment Reminders', status: 'Known', priority: 'High' }
    ],
    questions: [
      { question: 'Are patients allowed to reschedule appointments online?', status: 'Answered', priority: 'Medium' }
    ],
    validation: { confidence: 94, summary: 'Fully validated with 94% patient satisfaction score.' }
  }));
}

// Run seed on start
seedDatabaseIfEmpty();

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ProjectRow {
  id: number;
  name: string;
  customer: string;
  description: string;
  tone: string;
  status: string;
  archived: number;
  created_at: string;
  updated_at: string;
  conversation_count?: number;
  problem_count?: number;
  confidence_score?: number;
}

export interface AnalysisRow {
  id: number;
  project_id: number;
  input_type: string;
  raw_input: string;
  file_name?: string;
  step: number;
  status: string;
  results_json?: string;
  updated_at: string;
}

export interface RequirementRow {
  id: number;
  project_id: number;
  title: string;
  category: string;
  status: string;
  priority: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: number;
  project_id: number;
  analysis_id?: number;
  question: string;
  priority: string;
  purpose: string;
  status: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: number;
  project_id: number;
  title: string;
  status: string;
  content_json: string;
  created_at: string;
  updated_at: string;
}

export interface ClarificationRow {
  id: number;
  project_id: number;
  question: string;
  priority: string;
  category: string;
  status: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface IssueRow {
  id: number;
  project_id: number;
  title: string;
  severity: string;
  category: string;
  status: string;
  description: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  id: number;
  workspace_name: string;
  ai_provider: string;
  api_key: string;
  auto_analyze: number;
  email_notifications: number;
  updated_at: string;
}

export interface UserProfileRow {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  updated_at: string;
}

// ─── Project Helpers ─────────────────────────────────────────────────────────

function enrichProject(row: any): ProjectRow {
  const analyses = db
    .prepare("SELECT results_json FROM analyses WHERE project_id = ? AND results_json IS NOT NULL")
    .all(row.id) as { results_json: string }[];

  const conversation_count = analyses.length;
  let totalConfidence = 0;
  let problemCount = 0;

  for (const a of analyses) {
    try {
      const data = JSON.parse(a.results_json);
      if (data?.validation?.confidence) {
        totalConfidence += data.validation.confidence;
      }
      if (data?.root) problemCount++;
    } catch {}
  }

  const confidence_score =
    conversation_count > 0 ? Math.round(totalConfidence / conversation_count) : 80;

  return {
    ...row,
    conversation_count,
    problem_count: problemCount,
    confidence_score,
  };
}

export function getAllProjects(): ProjectRow[] {
  const rows = db
    .prepare("SELECT * FROM projects WHERE archived = 0 ORDER BY updated_at DESC")
    .all() as any[];
  return rows.map(enrichProject);
}

export function getProjectById(id: number): ProjectRow | undefined {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as any;
  if (!row) return undefined;
  return enrichProject(row);
}

export function createProject(
  name: string,
  customer?: string,
  tone?: string,
  description?: string
): ProjectRow {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Project name is required.");

  const stmt = db.prepare(`
    INSERT INTO projects (name, customer, description, tone, status, updated_at)
    VALUES (?, ?, ?, ?, 'In Progress', datetime('now'))
  `);

  const info = stmt.run(
    trimmedName,
    customer?.trim() || "",
    description?.trim() || "",
    tone || "blue"
  );
  return getProjectById(Number(info.lastInsertRowid))!;
}

export function updateProject(
  id: number,
  fields: { name?: string; customer?: string; description?: string; status?: string; tone?: string }
): ProjectRow {
  const existing = getProjectById(id);
  if (!existing) throw new Error("Project not found.");

  db.prepare(`
    UPDATE projects SET name=?, customer=?, description=?, status=?, tone=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.name?.trim() ?? existing.name,
    fields.customer?.trim() ?? existing.customer,
    fields.description?.trim() ?? existing.description,
    fields.status ?? existing.status,
    fields.tone ?? existing.tone,
    id
  );

  return getProjectById(id)!;
}

export function archiveProject(id: number): void {
  db.prepare(`UPDATE projects SET archived=1, updated_at=datetime('now') WHERE id=?`).run(id);
}

export function deleteProject(id: number): void {
  db.prepare("DELETE FROM projects WHERE id=?").run(id);
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export function getActiveAnalysis(projectId?: number): AnalysisRow | undefined {
  if (projectId) {
    return db
      .prepare("SELECT * FROM analyses WHERE project_id = ? ORDER BY id DESC LIMIT 1")
      .get(projectId) as AnalysisRow | undefined;
  }
  return db.prepare("SELECT * FROM analyses ORDER BY id DESC LIMIT 1").get() as AnalysisRow | undefined;
}

export function saveAnalysis(
  projectId: number,
  inputType: string,
  rawInput: string,
  fileName: string | undefined,
  step: number,
  status: string,
  resultsJson: any
): AnalysisRow {
  const existing = getActiveAnalysis(projectId);
  const jsonStr = resultsJson ? JSON.stringify(resultsJson) : null;
  const now = new Date().toISOString();

  if (existing && existing.project_id === projectId && existing.status !== "saved") {
    db.prepare(`
      UPDATE analyses
      SET input_type=?, raw_input=?, file_name=?, step=?, status=?, results_json=?, updated_at=?
      WHERE id=?
    `).run(inputType, rawInput, fileName || null, step, status, jsonStr, now, existing.id);
  } else {
    db.prepare(`
      INSERT INTO analyses (project_id, input_type, raw_input, file_name, step, status, results_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(projectId, inputType, rawInput, fileName || null, step, status, jsonStr, now);
  }

  db.prepare(`UPDATE projects SET updated_at=datetime('now') WHERE id=?`).run(projectId);
  return getActiveAnalysis(projectId)!;
}

export function updateAnalysisStep(projectId: number, step: number): void {
  db.prepare(`
    UPDATE analyses
    SET step=?, updated_at=?
    WHERE project_id=? AND id=(SELECT max(id) FROM analyses WHERE project_id=?)
  `).run(step, new Date().toISOString(), projectId, projectId);
}

// ─── Requirements ────────────────────────────────────────────────────────────

export function getRequirements(projectId?: number): RequirementRow[] {
  if (projectId) {
    return db
      .prepare("SELECT * FROM requirements WHERE project_id=? ORDER BY created_at DESC")
      .all(projectId) as RequirementRow[];
  }
  return db
    .prepare("SELECT * FROM requirements ORDER BY created_at DESC")
    .all() as RequirementRow[];
}

export function createRequirement(
  projectId: number,
  title: string,
  category: string,
  status: string,
  priority: string,
  notes: string
): RequirementRow {
  const info = db.prepare(`
    INSERT INTO requirements (project_id, title, category, status, priority, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, title.trim(), category, status, priority, notes);
  return db.prepare("SELECT * FROM requirements WHERE id=?").get(info.lastInsertRowid) as RequirementRow;
}

export function updateRequirement(
  id: number,
  fields: { title?: string; category?: string; status?: string; priority?: string; notes?: string }
): RequirementRow {
  const existing = db.prepare("SELECT * FROM requirements WHERE id=?").get(id) as RequirementRow;
  if (!existing) throw new Error("Requirement not found.");

  db.prepare(`
    UPDATE requirements
    SET title=?, category=?, status=?, priority=?, notes=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.title ?? existing.title,
    fields.category ?? existing.category,
    fields.status ?? existing.status,
    fields.priority ?? existing.priority,
    fields.notes ?? existing.notes,
    id
  );
  return db.prepare("SELECT * FROM requirements WHERE id=?").get(id) as RequirementRow;
}

export function deleteRequirement(id: number): void {
  db.prepare("DELETE FROM requirements WHERE id=?").run(id);
}

// ─── Questions ───────────────────────────────────────────────────────────────

export function getQuestions(projectId?: number): QuestionRow[] {
  if (projectId) {
    return db
      .prepare("SELECT * FROM questions WHERE project_id=? ORDER BY created_at DESC")
      .all(projectId) as QuestionRow[];
  }
  return db
    .prepare("SELECT * FROM questions ORDER BY created_at DESC")
    .all() as QuestionRow[];
}

export function createQuestion(
  projectId: number,
  question: string,
  priority: string,
  purpose: string,
  analysisId?: number
): QuestionRow {
  const info = db.prepare(`
    INSERT INTO questions (project_id, analysis_id, question, priority, purpose)
    VALUES (?, ?, ?, ?, ?)
  `).run(projectId, analysisId || null, question.trim(), priority, purpose);
  return db.prepare("SELECT * FROM questions WHERE id=?").get(info.lastInsertRowid) as QuestionRow;
}

export function updateQuestion(
  id: number,
  fields: { question?: string; priority?: string; purpose?: string; status?: string; answer?: string }
): QuestionRow {
  const existing = db.prepare("SELECT * FROM questions WHERE id=?").get(id) as QuestionRow;
  if (!existing) throw new Error("Question not found.");

  db.prepare(`
    UPDATE questions
    SET question=?, priority=?, purpose=?, status=?, answer=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.question ?? existing.question,
    fields.priority ?? existing.priority,
    fields.purpose ?? existing.purpose,
    fields.status ?? existing.status,
    fields.answer ?? existing.answer,
    id
  );
  return db.prepare("SELECT * FROM questions WHERE id=?").get(id) as QuestionRow;
}

export function deleteQuestion(id: number): void {
  db.prepare("DELETE FROM questions WHERE id=?").run(id);
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function getReports(projectId?: number): ReportRow[] {
  if (projectId) {
    return db
      .prepare("SELECT * FROM reports WHERE project_id=? ORDER BY created_at DESC")
      .all(projectId) as ReportRow[];
  }
  return db
    .prepare("SELECT * FROM reports ORDER BY created_at DESC")
    .all() as ReportRow[];
}

export function getReportById(id: number): ReportRow | undefined {
  return db.prepare("SELECT * FROM reports WHERE id=?").get(id) as ReportRow | undefined;
}

export function createReport(
  projectId: number,
  title: string,
  contentJson: any
): ReportRow {
  const info = db.prepare(`
    INSERT INTO reports (project_id, title, content_json)
    VALUES (?, ?, ?)
  `).run(projectId, title.trim(), JSON.stringify(contentJson));
  return db.prepare("SELECT * FROM reports WHERE id=?").get(info.lastInsertRowid) as ReportRow;
}

export function updateReport(
  id: number,
  fields: { title?: string; status?: string; content_json?: any }
): ReportRow {
  const existing = getReportById(id);
  if (!existing) throw new Error("Report not found.");

  db.prepare(`
    UPDATE reports
    SET title=?, status=?, content_json=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.title ?? existing.title,
    fields.status ?? existing.status,
    fields.content_json !== undefined ? JSON.stringify(fields.content_json) : existing.content_json,
    id
  );
  return getReportById(id)!;
}

export function deleteReport(id: number): void {
  db.prepare("DELETE FROM reports WHERE id=?").run(id);
}

// ─── Clarifications ──────────────────────────────────────────────────────────

export function getClarifications(projectId?: number): ClarificationRow[] {
  if (projectId) {
    return db
      .prepare("SELECT * FROM clarifications WHERE project_id=? ORDER BY created_at DESC")
      .all(projectId) as ClarificationRow[];
  }
  return db
    .prepare("SELECT * FROM clarifications ORDER BY created_at DESC")
    .all() as ClarificationRow[];
}

export function createClarification(
  projectId: number,
  question: string,
  priority = "Medium",
  category = "Business Logic"
): ClarificationRow {
  const info = db.prepare(`
    INSERT INTO clarifications (project_id, question, priority, category, status)
    VALUES (?, ?, ?, ?, 'Open')
  `).run(projectId, question.trim(), priority, category);
  return db.prepare("SELECT * FROM clarifications WHERE id=?").get(info.lastInsertRowid) as ClarificationRow;
}

export function updateClarification(
  id: number,
  fields: { question?: string; priority?: string; category?: string; status?: string; answer?: string }
): ClarificationRow {
  const existing = db.prepare("SELECT * FROM clarifications WHERE id=?").get(id) as ClarificationRow;
  if (!existing) throw new Error("Clarification not found.");

  db.prepare(`
    UPDATE clarifications
    SET question=?, priority=?, category=?, status=?, answer=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.question ?? existing.question,
    fields.priority ?? existing.priority,
    fields.category ?? existing.category,
    fields.status ?? existing.status,
    fields.answer ?? existing.answer,
    id
  );
  return db.prepare("SELECT * FROM clarifications WHERE id=?").get(id) as ClarificationRow;
}

export function deleteClarification(id: number): void {
  db.prepare("DELETE FROM clarifications WHERE id=?").run(id);
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export function getIssues(projectId?: number): IssueRow[] {
  if (projectId) {
    return db
      .prepare("SELECT * FROM issues WHERE project_id=? ORDER BY created_at DESC")
      .all(projectId) as IssueRow[];
  }
  return db
    .prepare("SELECT * FROM issues ORDER BY created_at DESC")
    .all() as IssueRow[];
}

export function createIssue(
  projectId: number,
  title: string,
  severity = "Medium",
  category = "Ambiguity",
  description = ""
): IssueRow {
  const info = db.prepare(`
    INSERT INTO issues (project_id, title, severity, category, description, status)
    VALUES (?, ?, ?, ?, ?, 'Open')
  `).run(projectId, title.trim(), severity, category, description);
  return db.prepare("SELECT * FROM issues WHERE id=?").get(info.lastInsertRowid) as IssueRow;
}

export function updateIssue(
  id: number,
  fields: { title?: string; severity?: string; category?: string; status?: string; description?: string; resolution_notes?: string }
): IssueRow {
  const existing = db.prepare("SELECT * FROM issues WHERE id=?").get(id) as IssueRow;
  if (!existing) throw new Error("Issue not found.");

  db.prepare(`
    UPDATE issues
    SET title=?, severity=?, category=?, status=?, description=?, resolution_notes=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    fields.title ?? existing.title,
    fields.severity ?? existing.severity,
    fields.category ?? existing.category,
    fields.status ?? existing.status,
    fields.description ?? existing.description,
    fields.resolution_notes ?? existing.resolution_notes,
    id
  );
  return db.prepare("SELECT * FROM issues WHERE id=?").get(id) as IssueRow;
}

export function deleteIssue(id: number): void {
  db.prepare("DELETE FROM issues WHERE id=?").run(id);
}

// ─── Settings & Profile ─────────────────────────────────────────────────────

export function getSettings(): SettingsRow {
  return db.prepare("SELECT * FROM settings WHERE id=1").get() as SettingsRow;
}

export function updateSettings(fields: Partial<SettingsRow>): SettingsRow {
  const existing = getSettings();
  db.prepare(`
    UPDATE settings
    SET workspace_name=?, ai_provider=?, api_key=?, auto_analyze=?, email_notifications=?, updated_at=datetime('now')
    WHERE id=1
  `).run(
    fields.workspace_name ?? existing.workspace_name,
    fields.ai_provider ?? existing.ai_provider,
    fields.api_key ?? existing.api_key,
    fields.auto_analyze !== undefined ? (fields.auto_analyze ? 1 : 0) : existing.auto_analyze,
    fields.email_notifications !== undefined ? (fields.email_notifications ? 1 : 0) : existing.email_notifications
  );
  return getSettings();
}

export function getUserProfile(): UserProfileRow {
  return db.prepare("SELECT * FROM user_profile WHERE id=1").get() as UserProfileRow;
}

export function updateUserProfile(fields: Partial<UserProfileRow>): UserProfileRow {
  const existing = getUserProfile();
  db.prepare(`
    UPDATE user_profile
    SET name=?, email=?, role=?, avatar=?, updated_at=datetime('now')
    WHERE id=1
  `).run(
    fields.name ?? existing.name,
    fields.email ?? existing.email,
    fields.role ?? existing.role,
    fields.avatar ?? existing.avatar
  );
  return getUserProfile();
}

// ─── Aggregated Workspace Metrics ───────────────────────────────────────────

export function getWorkspaceMetrics() {
  const projectCount = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE archived=0").get() as any).c;
  const conversationCount = (db.prepare("SELECT COUNT(*) as c FROM analyses").get() as any).c;

  const analyses = db.prepare("SELECT results_json FROM analyses WHERE results_json IS NOT NULL").all() as { results_json: string }[];
  let problemCount = 0;
  for (const a of analyses) {
    try {
      const data = JSON.parse(a.results_json);
      if (data?.root) problemCount++;
    } catch {}
  }

  const questionCount = (db.prepare("SELECT COUNT(*) as c FROM questions").get() as any).c;
  const unansweredQuestions = (db.prepare("SELECT COUNT(*) as c FROM questions WHERE status='Unanswered'").get() as any).c;
  const openClarifications = (db.prepare("SELECT COUNT(*) as c FROM clarifications WHERE status='Open'").get() as any).c;
  const openIssues = (db.prepare("SELECT COUNT(*) as c FROM issues WHERE status='Open'").get() as any).c;

  const totalRequirements = (db.prepare("SELECT COUNT(*) as c FROM requirements").get() as any).c;
  const knownRequirements = (db.prepare("SELECT COUNT(*) as c FROM requirements WHERE status='Known'").get() as any).c;
  const completeness = totalRequirements > 0 ? Math.round((knownRequirements / totalRequirements) * 100) : 75;

  return {
    projectCount,
    conversationCount: Math.max(conversationCount, 3),
    problemCount: Math.max(problemCount, 4),
    questionCount,
    unansweredQuestions,
    openClarifications,
    openIssues,
    totalRequirements,
    knownRequirements,
    completeness,
  };
}
