/**
 * AI Service - re-exports AI analysis helpers from server/api.ts
 * This module provides the AI analysis capability used by the analysis controller.
 */
export { performAiAnalysis, extractTextFromBuffer } from "../../api.js";
export type { AnalysisResultData } from "../../api.js";
