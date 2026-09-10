/**
 * server/src/index.ts — Modular server entry point
 * Imports routes from server/src/routes/apiRoutes.ts
 * The database is handled by server/src/database/db.ts
 */
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/apiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Mount all API routes under /api
  app.use("/api", apiRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing — serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
