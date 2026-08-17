import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import skillsRouter from "./routes/skills.js";
import pathRouter from "./routes/path.js";
import matchedRolesRouter from "./routes/matchedRoles.js";
import rolesRouter from "./routes/roles.js";
import graphRouter from "./routes/graph.js";
import { closeDriver, verifyConnection } from "./db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// ── Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api", healthRouter);
app.use("/api", skillsRouter);
app.use("/api", pathRouter);
app.use("/api", matchedRolesRouter);
app.use("/api", rolesRouter);
app.use("/api", graphRouter);

// ── Root endpoint ──────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Skill Path Finder API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// ── Start server ───────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       Skill Path Finder API                  ║");
  console.log(`║       Running on http://localhost:${PORT}        ║`);
  console.log("╚══════════════════════════════════════════════╝");
  console.log("");

  // Test database connection on startup
  const dbStatus = await verifyConnection();
  if (!dbStatus.connected) {
    console.warn("⚠️  API started but database is not reachable.");
    console.warn("   The API will still respond, but data routes will fail.");
  }
});

// ── Graceful shutdown ──────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await closeDriver();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
