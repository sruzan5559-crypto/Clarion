/**
 * Error handler middleware for Express
 * Catches and formats errors in a consistent JSON response format.
 */
import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Server Error]", err.message || err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
