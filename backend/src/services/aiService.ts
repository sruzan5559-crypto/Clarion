/**
 * AI Service - re-exports AI analysis helpers from server/api.ts
 * This module provides the AI analysis capability used by the analysis controller.
 */
export { extractTextFromBuffer } from "../controllers/apiController.js";
export { analyzeCustomerInput, analyzeRequirementInput, generateGuidance, getAiHealth } from "./aiProviderService.js";
export type { AnalysisResultData } from "../controllers/apiController.js";
