import { Router, Request, Response } from "express";
import { verifyConnection } from "../db.js";

const router = Router();

/**
 * GET /api/health
 * 
 * Health check endpoint that verifies CognoDB connectivity.
 * Returns 200 on success, 503 if the database is unreachable.
 */
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const result = await verifyConnection();

    if (result.connected) {
      res.status(200).json({
        status: "ok",
        database: "connected",
        latency: `${result.latencyMs}ms`,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "error",
        database: "disconnected",
        message: result.error || "Database unreachable",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
