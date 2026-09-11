import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { z, type ZodType } from "zod";

export const StructuredAnalysisSchema = z.object({
  goal: z.string().min(1),
  statedProblems: z.string().min(1),
  rootProblems: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  evidence: z.array(z.object({ quote: z.string().min(1), interpretation: z.string().min(1) })).min(1),
  assumptions: z.array(z.object({ title: z.string(), description: z.string(), confidence: z.number().min(0).max(100), status: z.string() })),
  missingContext: z.array(z.object({ title: z.string(), description: z.string(), priority: z.string() })),
  conflicts: z.array(z.object({ topic: z.string(), description: z.string(), impact: z.string() })),
  requirements: z.array(z.object({ title: z.string(), description: z.string(), priority: z.string(), category: z.string() })),
  confidence: z.number().min(0).max(100),
  followUpQuestions: z.array(z.object({ question: z.string(), priority: z.string(), purpose: z.string() })).min(1),
});

export type StructuredAnalysis = z.infer<typeof StructuredAnalysisSchema>;

export const RequirementAnalysisSchema = z.object({
  businessNeed: z.string().min(1),
  requirements: z.array(z.object({ title: z.string(), description: z.string(), category: z.string(), priority: z.string(), confidence: z.number().min(0).max(100) })).min(1),
  functionalRequirements: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()),
  businessRules: z.array(z.string()),
  actors: z.array(z.string()),
  ambiguities: z.array(z.object({ title: z.string(), description: z.string(), priority: z.string() })),
  missingInformation: z.array(z.object({ title: z.string(), question: z.string(), priority: z.string() })),
  conflicts: z.array(z.object({ topic: z.string(), description: z.string(), impact: z.string() })),
  risks: z.array(z.string()),
  dependencies: z.array(z.string()),
  edgeCases: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()).min(1),
  followUpQuestions: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(100),
});

const GuidanceSchema = z.object({ guidance: z.string().min(1) });

type ProviderSettings = {
  geminiKey?: string;
  groqKey?: string;
  geminiModel: string;
  groqModel: string;
};

function loadBackendEnv() {
  const envPath = path.resolve(process.cwd(), "backend/.env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function settings(): ProviderSettings {
  loadBackendEnv();
  return {
    geminiKey: process.env.GEMINI_API_KEY || undefined,
    groqKey: process.env.GROQ_API_KEY || undefined,
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  };
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs)),
  ]);
}

function parseProviderJson(text: string): unknown {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("The AI provider returned invalid JSON.");
  }
}

function validateResult<T>(schema: ZodType<T>, text: string): T {
  const result = schema.safeParse(parseProviderJson(text));
  if (!result.success) {
    throw new Error(`The AI provider returned an invalid structured result: ${result.error.issues[0]?.message || "schema validation failed"}`);
  }
  return result.data;
}

async function callGemini(prompt: string, modelName: string, key: string): Promise<string> {
  const client = new GoogleGenAI({ apiKey: key });
  const result = await withTimeout(client.models.generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.2 },
  }), "Gemini");
  return result.text || "";
}

async function callGroq(prompt: string, modelName: string, key: string): Promise<string> {
  const client = new Groq({ apiKey: key });
  const result = await withTimeout(client.chat.completions.create({
    model: modelName,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a customer discovery analyst. Return valid JSON only." },
      { role: "user", content: prompt },
    ],
  }), "Groq");
  return result.choices[0]?.message?.content || "";
}

async function runStructured<T>(prompt: string, schema: ZodType<T>): Promise<{ data: T; provider: "gemini" | "groq" }> {
  const config = settings();
  const preferred = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const order = preferred === "groq" ? ["groq", "gemini"] : ["gemini", "groq"];
  let geminiError = "Gemini is not configured.";
  let groqError = "Groq is not configured.";

  for (const provider of order) {
    if (provider === "gemini" && config.geminiKey) {
      try {
        return { data: validateResult(schema, await callGemini(prompt, config.geminiModel, config.geminiKey)), provider: "gemini" };
      } catch (error: any) {
        geminiError = error?.message || "Gemini request failed.";
      }
    }
    if (provider === "groq" && config.groqKey) {
      try {
        return { data: validateResult(schema, await callGroq(prompt, config.groqModel, config.groqKey)), provider: "groq" };
      } catch (error: any) {
        groqError = error?.message || "Groq request failed.";
      }
    }
  }

  throw new Error(`All AI providers failed. ${geminiError} ${groqError}`);
}

function analysisPrompt(inputType: string, content: string) {
  return `Analyze this ${inputType} customer input. Return JSON only with exactly these fields and types: {"goal":string,"statedProblems":string,"rootProblems":string,"symptoms":string[],"evidence":[{"quote":string,"interpretation":string}],"assumptions":[{"title":string,"description":string,"confidence":number,"status":string}],"missingContext":[{"title":string,"description":string,"priority":string}],"conflicts":[{"topic":string,"description":string,"impact":string}],"requirements":[{"title":string,"description":string,"priority":string,"category":string}],"confidence":number,"followUpQuestions":[{"question":string,"priority":string,"purpose":string}]}. Include at least one item in symptoms, evidence, and followUpQuestions. Ground every finding in the input and never invent quotes.\n\nINPUT:\n${content}`;
}

export async function analyzeCustomerInput(inputType: string, content: string) {
  const result = await runStructured(analysisPrompt(inputType, content), StructuredAnalysisSchema);
  if (result.data.confidence <= 1) result.data.confidence *= 100;
  for (const assumption of result.data.assumptions) {
    if (assumption.confidence <= 1) assumption.confidence *= 100;
  }
  return result;
}

export async function analyzeRequirementInput(content: string) {
  const result = await runStructured(`Analyze this product or business request. Return JSON only with exactly these fields and types: {"businessNeed":string,"requirements":[{"title":string,"description":string,"category":string,"priority":string,"confidence":number}],"functionalRequirements":string[],"nonFunctionalRequirements":string[],"businessRules":string[],"actors":string[],"ambiguities":[{"title":string,"description":string,"priority":string}],"missingInformation":[{"title":string,"question":string,"priority":string}],"conflicts":[{"topic":string,"description":string,"impact":string}],"risks":string[],"dependencies":string[],"edgeCases":string[],"acceptanceCriteria":string[],"followUpQuestions":string[],"confidence":number}. Include at least one requirement, acceptance criterion, and follow-up question. Ground every recommendation in the input.\n\nINPUT:\n${content}`, RequirementAnalysisSchema);
  if (result.data.confidence <= 1) result.data.confidence *= 100;
  for (const requirement of result.data.requirements) {
    if (requirement.confidence <= 1) requirement.confidence *= 100;
  }
  return result;
}

export async function generateGuidance(context: { projectName: string; step: number; analysisResult?: unknown }) {
  const result = await runStructured(`Return JSON only with a single guidance string. Give concise, contextual guidance for a customer discovery workflow. Project: ${context.projectName}. Current step: ${context.step}. Real analysis result: ${JSON.stringify(context.analysisResult || null)}`, GuidanceSchema);
  return { ...result, data: result.data.guidance };
}

export function getAiHealth() {
  const config = settings();
  return {
    provider: "gemini",
    fallback: "groq",
    gemini: { configured: Boolean(config.geminiKey), model: config.geminiModel },
    groq: { configured: Boolean(config.groqKey), model: config.groqModel },
  };
}
