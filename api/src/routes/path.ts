import { Router, Request, Response } from "express";
import { getDriver } from "../db.js";

const router = Router();

/**
 * POST /api/path
 *
 * Given a "from" skill and a "to" skill, returns the shortest path between them
 * traversing PREREQUISITE_OF and RELATED_TO relationships.
 *
 * Request body: { from: string, to: string }
 * Response: { path: { name, category }[], hops: number, relationships: string[] }
 */
router.post("/path", async (req: Request, res: Response) => {
  const { from, to } = req.body;

  if (!from || !to) {
    res.status(400).json({
      error: "Missing required fields: 'from' and 'to' skill names",
    });
    return;
  }

  if (from === to) {
    res.status(400).json({
      error: "Source and target skills must be different",
    });
    return;
  }

  const session = getDriver().session();

  try {
    // First verify both skills exist
    const existCheck = await session.run(
      `
      OPTIONAL MATCH (a:Skill {name: $from})
      OPTIONAL MATCH (b:Skill {name: $to})
      RETURN a IS NOT NULL AS fromExists, b IS NOT NULL AS toExists
      `,
      { from, to }
    );

    const record = existCheck.records[0];
    const fromExists = record.get("fromExists");
    const toExists = record.get("toExists");

    if (!fromExists || !toExists) {
      const missing = [];
      if (!fromExists) missing.push(`"${from}"`);
      if (!toExists) missing.push(`"${to}"`);
      res.status(404).json({
        error: `Skill(s) not found: ${missing.join(", ")}`,
      });
      return;
    }

    // Find shortest path using both relationship types
    const result = await session.run(
      `
      MATCH p = shortestPath(
        (a:Skill {name: $from})-[:PREREQUISITE_OF|RELATED_TO*]-(b:Skill {name: $to})
      )
      RETURN
        [n IN nodes(p) | {name: n.name, category: n.category}] AS path,
        length(p) AS hops,
        [r IN relationships(p) | type(r)] AS relationshipTypes
      `,
      { from, to }
    );

    if (result.records.length === 0) {
      res.json({
        path: [],
        hops: 0,
        relationships: [],
        message: `No path found between "${from}" and "${to}"`,
      });
      return;
    }

    const pathRecord = result.records[0];
    const path = pathRecord.get("path") as { name: string; category: string }[];
    const hops = pathRecord.get("hops") as number;
    const relationshipTypes = pathRecord.get("relationshipTypes") as string[];

    res.json({
      from,
      to,
      path,
      hops,
      relationships: relationshipTypes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error finding path:", message);
    res.status(500).json({ error: "Failed to find path", message });
  } finally {
    await session.close();
  }
});

export default router;
